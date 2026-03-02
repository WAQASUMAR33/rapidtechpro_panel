import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding database with admin user...\n');

    // Check if admin user exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'admin@company.com' },
    });

    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      console.log('  Email: admin@company.com');
      console.log('  Password: Admin@123\n');
      return;
    }

    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        email: 'admin@company.com',
        password: 'Admin@123',
      },
    });

    console.log('✓ Admin user created successfully!\n');
    console.log('📝 Admin Credentials:');
    console.log('  Email: admin@company.com');
    console.log('  Password: Admin@123\n');
    console.log('🔗 Access the login at: http://localhost:3000\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
