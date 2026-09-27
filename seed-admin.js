require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@company.com';
    const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    console.log(`Setting up admin user (${email})...`);

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
      },
    });

    console.log('✅ Admin user synced successfully!');
    console.log('\nLogin credentials:');
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${rawPassword}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
