require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Usage: node scripts/reset-admin-password.js <email> <newPassword>');
  process.exit(1);
}

const prisma = new PrismaClient({ log: [] });

async function run() {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: { email, password: hashedPassword },
    });
    console.log(`✅ Password successfully updated for ${admin.email} (id ${admin.id})`);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
