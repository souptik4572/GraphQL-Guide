import { arg, extendType, intArg, nonNull, nullable, objectType, stringArg } from 'nexus';

export const LinkFeed = objectType({
	name: 'LinkFeed',
	definition(t) {
		t.nonNull.list.nonNull.field('links', { type: 'Link' }), t.nonNull.int('count');
	},
});

export const Link = objectType({
	name: 'Link',
	definition(t) {
		t.nonNull.int('id'),
			t.nonNull.string('description'),
			t.nonNull.string('url'),
			t.field('linkPostedBy', {
				type: 'User',
				resolve(parent, args, context, info) {
					return context.prisma.link
						.findUnique({
							where: {
								id: parent.id,
							},
						})
						.linkCreatedBy();
				},
			}),
			t.nonNull.list.nonNull.field('voters', {
				type: 'User',
				resolve(parent, args, context, info) {
					return context.prisma.link
						.findUnique({
							where: {
								id: parent.id,
							},
						})
						.voters();
				},
			});
	},
});

export const LinkQuery = extendType({
	type: 'Query',
	definition(t) {
		t.field('getAllLinks', {
			type: 'LinkFeed',
			args: {
				filter: stringArg(),
				skip: intArg(),
				take: intArg(),
			},
			async resolve(parent, args, context, info) {
				const where = args.filter
					? {
							OR: [
								{ description: { contains: args.filter } },
								{ url: { contains: args.filter } },
							],
					  }
					: {};
				const links = await context.prisma.link.findMany({
					where,
					skip: args?.skip ? (args.skip as number) : undefined,
					take: args?.take ? (args.take as number) : undefined,
				});
				const count = await context.prisma.link.count();
				return {
					count,
					links,
				};
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
				if (!!!context.userId) throw new Error('Cannot add link without logging in');
				return context.prisma.link.create({
					data: {
						url,
						description,
						linkCreatedBy: {
							connect: {
								id: context.userId,
							},
						},
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
			async resolve(parent, args, context, info) {
				const { id, url, description } = args;
				if (!!!context.userId) throw new Error('Cannot update link without logging in');
				const existingLink = await context.prisma.link.findUnique({
					where: {
						id,
					},
				});
				if (existingLink?.userId !== context.userId)
					throw new Error('Link does not belong to logged in user');
				let updatedLink;
				if (!!url && !!description) updatedLink = { url, description };
				else if (!!url) updatedLink = { url };
				else if (!!description) updatedLink = { description };
				return context.prisma.link.update({
					where: {
						id,
					},
					data: {
						...updatedLink,
					},
				});
			},
		});
		t.nullable.field('deleteLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
			},
			async resolve(parent, args, context, info) {
				const { id } = args;
				if (!!!context.userId) throw new Error('Cannot delete link without logging in');
				const existingLink = await context.prisma.link.findUnique({
					where: {
						id,
					},
				});
				if (existingLink?.userId !== context.userId)
					throw new Error('Link does not belong to logged in user');
				return context.prisma.link.delete({
					where: {
						id,
					},
				});
			},
		});
	},
});
