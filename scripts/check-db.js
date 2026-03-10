const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColumns() {
    try {
        const result = await prisma.$queryRaw`SHOW COLUMNS FROM projects`;
        console.log('Columns in projects table:');
        console.table(result);
    } catch (error) {
        console.error('Error checking columns:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkColumns();
