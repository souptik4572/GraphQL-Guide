import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const newLink = await prisma.link.create({
		data: {
			url: 'This is a sample url',
			description: 'This is a sample description for a sample url',
		},
	});
	const allLinks = await prisma.link.findMany();
	console.log(allLinks);
}

main()
	.catch((error) => {
		throw error;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
