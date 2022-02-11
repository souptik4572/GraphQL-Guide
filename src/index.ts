import { ApolloServer } from 'apollo-server';
import { schema } from './schema';
import { context } from './context';

export const app = new ApolloServer({
	schema,
	context,
});

const PORT = process.env.PORT || 3000;
app.listen(PORT).then(({ url }) => {
	console.log(`Server is up and running at ${url}`);
});
