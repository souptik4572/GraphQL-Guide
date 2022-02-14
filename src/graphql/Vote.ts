import { User } from '@prisma/client';
import { extendType, intArg, nonNull, objectType, stringArg } from 'nexus';

export const Vote = objectType({
	name: 'Vote',
	definition(t) {
		t.nonNull.field('link', { type: 'Link' }),
			t.nonNull.field('user', {
				type: 'User',
			});
	},
});

export const VoteMessage = objectType({
	name: 'VoteMessage',
	definition(t) {
		t.nonNull.string('message'),
			t.nonNull.field('link', { type: 'Link' }),
			t.nonNull.field('user', { type: 'User' });
	},
});

export const VoteMutation = extendType({
	type: 'Mutation',
	definition(t) {
		t.nonNull.field('castVote', {
			type: 'VoteMessage',
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
				let link, message;
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
					message = 'Removed vote successfully';
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
					message = 'Added vote successfully';
				}
				const user = await context.prisma.user.findUnique({
					where: {
						id: userId,
					},
				});
				return {
                    message,
					link,
					user,
				};
			},
		});
	},
});
