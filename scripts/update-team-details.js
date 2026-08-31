const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ log: [] });

// name -> details confirmed against the live "Meet Our Experts" section
const TEAM_DETAILS = [
    { name: 'Muhammad Waqas Umar', gender: 'male', isCeo: true },
    { name: 'Kashif Rasheed', gender: 'male', isCeo: false },
    { name: 'Hannan Khan', gender: 'male', isCeo: false },
    { name: 'Ali Iftikhar', gender: 'male', isCeo: false },
    { name: 'Usama Aslam', gender: 'male', isCeo: false },
    // Zofia had Nabiya's photo attached; cleared so the female placeholder is used
    { name: 'Zofia', gender: 'female', isCeo: false, image: null },
    { name: 'Nabiya', gender: 'female', isCeo: false },
    { name: 'Azzam Kashif', gender: 'male', isCeo: false },
    { name: 'Wasiq Saqlain', gender: 'male', isCeo: false },
];

async function main() {
    for (const { name, ...data } of TEAM_DETAILS) {
        const result = await prisma.teamMember.updateMany({ where: { name }, data });
        console.log(`${result.count ? 'updated' : 'NOT FOUND'}: ${name} -> ${JSON.stringify(data)}`);
    }
}

main()
    .catch((e) => {
        console.error('ERR', e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
