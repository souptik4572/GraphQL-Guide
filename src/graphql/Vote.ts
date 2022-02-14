import { User } from '@prisma/client';
import { extendType, intArg, nonNull, objectType } from 'nexus';

export const Vote = objectType({
	name: 'Vote',
	definition(t) {
		t.nonNull.field('link', { type: 'Link' }),
			t.nonNull.field('user', {
				type: 'User',
			});
	},
});

export const VoteMutation = extendType({
	type: 'Mutation',
	definition(t) {
		t.nonNull.field('castVote', {
			type: 'Vote',
			args: {
				linkId: nonNull(intArg()),
			},
			async resolve(parent, args, context) {
				const { userId } = context;
				const { linkId } = args;
				if (!!!userId) throw new Error('Cannot cast vote without logging in');
				const allVoters = await context.prisma.link
					.findUnique({
						where: {
							id: linkId,
						},
					})
					.voters();
				const hasVoted = allVoters.findIndex((aVoter) => aVoter.id === userId) !== -1;
				let link;
				if (hasVoted) {
					link = await context.prisma.link.update({
						where: {
							id: linkId,
						},
						data: {
							voters: {
								disconnect: {
									id: userId,
								},
							},
						},
					});
				} else {
					link = await context.prisma.link.update({
						where: {
							id: linkId,
						},
						data: {
							voters: {
								connect: {
									id: userId,
								},
							},
						},
					});
				}
                const user = await context.prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                });
				return {
					link,
                    user,
				};
			},
		});
	},
});
