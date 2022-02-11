import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

interface Context {
	prisma: PrismaClient;
}

export const context: Context = {
	prisma,
};
