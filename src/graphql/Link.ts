import { extendType, intArg, nonNull, nullable, objectType, stringArg } from 'nexus';
import { NexusGenObjects } from '../../nexus-typegen';

export const Link = objectType({
	name: 'Link',
	definition(t) {
		t.nonNull.int('id'), t.nonNull.string('description'), t.nonNull.string('url');
	},
});

export const LinkQuery = extendType({
	type: 'Query',
	definition(t) {
		t.nonNull.list.nonNull.field('getAllLinks', {
			type: 'Link',
			resolve(parent, args, context, info) {
				return context.prisma.link.findMany();
			},
		});
		t.nullable.field('getLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
			},
			resolve(parent, args, context) {
				const { id } = args;
				return context.prisma.link.findUnique({
					where: {
						id,
					},
				});
			},
		});
	},
});

export const LinkMutation = extendType({
	type: 'Mutation',
	definition(t) {
		t.nonNull.field('createLink', {
			type: 'Link',
			args: {
				url: nonNull(stringArg()),
				description: nonNull(stringArg()),
			},
			resolve(parent, args, context) {
				const { url, description } = args;
				return context.prisma.link.create({
					data: {
						url,
						description,
					},
				});
			},
		});
		t.nullable.field('updateLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
				url: nullable(stringArg()),
				description: nullable(stringArg()),
			},
			resolve(parent, args, context, info) {
				const { id, url, description } = args;
				return context.prisma.link.update({
					where: {
						id,
					},
					data: {
						url,
						description,
					},
				});
			},
		});
		t.nullable.field('deleteLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
			},
			resolve(parent, args, context, info) {
				const { id } = args;
				return context.prisma.link.delete({
					where: {
						id,
					},
				});
			},
		});
	},
});
