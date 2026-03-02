const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating admin user...');
    const admin = await prisma.adminUser.create({
      data: {
        email: 'admin@company.com',
        password: 'Admin@123',
      },
    }).catch(async (e) => {
      if (e.code === 'P2002') {
        console.log('Admin user already exists');
        return await prisma.adminUser.findUnique({
          where: { email: 'admin@company.com' }
        });
      }
      throw e;
    });

    console.log('✅ Done!');
    console.log('Admin:', admin);
    console.log('\nLogin with:');
    console.log('Email: admin@company.com');
    console.log('Password: Admin@123');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
