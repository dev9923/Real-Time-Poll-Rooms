
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Successfully connected!');
        const count = await prisma.poll.count();
        console.log(`Current poll count: ${count}`);
    } catch (e) {
        console.error('DB Connection Failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
