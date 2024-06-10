import { PrismaClient } from '@prisma/client';

declare global {
    // Allow the `prisma` property to be added to the global object
    var prisma: PrismaClient | undefined;
}

// Check if there's already an instance of PrismaClient assigned to the global object, otherwise create a new instance
const prisma = global.prisma || new PrismaClient();

// Assign the instance to the global object if not in production environment
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
