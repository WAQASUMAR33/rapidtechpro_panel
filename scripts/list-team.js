const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [] });
prisma.teamMember.findMany({ orderBy: { id: 'asc' } })
  .then(rows => console.log(JSON.stringify(rows.map(r => ({ id: r.id, name: r.name, designation: r.designation, role: r.role, gender: r.gender, isCeo: r.isCeo, image: r.image })), null, 2)))
  .catch(e => { console.error('ERR', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
