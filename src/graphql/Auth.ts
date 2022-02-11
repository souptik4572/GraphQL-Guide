import { extendType, nonNull, objectType, stringArg } from 'nexus';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from 'dotenv';

const ACCESS_SECRET_TOKEN = <jwt.Secret>(
	'e1ba726da7e44ddd3945fab98e99fa0fb417c8eb63d60c555299f682d460ca9434b619de5d211fa3dbdff8274ab7adcafc5820844411b3b143748af986b6d1b7'
);

export const AuthPayload = objectType({
	name: 'AuthPayload',
	definition(t) {
		t.nonNull.string('token'),
			t.nonNull.field('user', {
				type: 'User',
			});
	},
});

export const AuthMutation = extendType({
	type: 'Mutation',
	definition(t) {
		t.nonNull.field('signupUser', {
			type: 'AuthPayload',
			args: {
				name: nonNull(stringArg()),
				email: nonNull(stringArg()),
				password: nonNull(stringArg()),
			},
			async resolve(parent, args, context, info) {
				const { name, email } = args;
				const password = await bcrypt.hash(args.password, 10);
				const user = await context.prisma.user.create({
					data: {
						name,
						email,
						password,
					},
				});
				const token = jwt.sign({ userId: user.id }, ACCESS_SECRET_TOKEN);
				return {
					token,
					user,
				};
			},
		});
		t.nonNull.field('loginUser', {
			type: 'AuthPayload',
			args: {
				email: nonNull(stringArg()),
				password: nonNull(stringArg()),
			},
			async resolve(parent, args, context, info) {
				const { email } = args;
				const user = await context.prisma.user.findUnique({
					where: {
						email,
					},
				});
				if (!user) throw new Error('No user found with given email');
				const isPasswordValid = bcrypt.compare(user.password, args.password);
				if (!isPasswordValid) throw new Error('Password is incorrect');
				const token = jwt.sign({ userId: user.id }, ACCESS_SECRET_TOKEN);
				return {
					token,
					user,
				};
			},
		});
	},
});
