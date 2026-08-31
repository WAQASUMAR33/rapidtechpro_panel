const { PrismaClient } = require('@prisma/client');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/reset-admin-password.js <email> <newPassword>');
  process.exit(1);
}

const prisma = new PrismaClient({ log: [] });

prisma.adminUser
  .update({ where: { email }, data: { password } })
  .then((admin) => console.log(`Password updated for ${admin.email} (id ${admin.id})`))
  .catch((e) => {
    console.error('ERR', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
