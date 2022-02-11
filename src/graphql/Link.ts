import { extendType, intArg, nonNull, nullable, objectType, stringArg } from 'nexus';
import { NexusGenObjects } from '../../nexus-typegen';

export const Link = objectType({
	name: 'Link',
	definition(t) {
		t.nonNull.int('id'), t.nonNull.string('description'), t.nonNull.string('url');
	},
});

let links: NexusGenObjects['Link'][] = [
	{
		id: 1,
		url: 'www.howtographql.com',
		description: 'Fullstack tutorial for graphql',
	},
	{
		id: 2,
		url: 'graphql.org',
		description: 'GraphQL official website',
	},
];

export const LinkQuery = extendType({
	type: 'Query',
	definition(t) {
		t.nonNull.list.nonNull.field('getAllLinks', {
			type: 'Link',
			resolve(parent, args, context, info) {
				return links;
			},
		});
		t.nullable.field('getLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
			},
			resolve(parent, args, context) {
				const { id } = args;
				return links.filter((aLink) => aLink.id === id)[0];
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
				const idCount = links.length + 1;
				const newLink = {
					id: idCount,
					url,
					description,
				};
				links.push(newLink);
				return newLink;
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
				const particularLink = links.filter((aLink) => aLink.id === id)[0];
				if (!!!particularLink) return null;
				if (!!url) particularLink.url = url;
				if (!!description) particularLink.description = description;
				return particularLink;
			},
		});
		t.nullable.field('deleteLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
			},
			resolve(parent, args, context, info) {
				const { id } = args;
				const particularLink = links.filter((aLink) => aLink.id === id)[0];
				if (!!!particularLink) return null;
				links = links.filter((aLink) => aLink.id !== id);
				return particularLink;
			},
		});
	},
});
