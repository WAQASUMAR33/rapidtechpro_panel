const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    try {
        console.log('Seeding Categories...');
        const categories = [
            { name: 'Personal Care' },
            { name: 'Electronics' },
            { name: 'Digital Goods' },
            { name: 'Home Appliances' },
            { name: 'Health & Wellness' },
            { name: 'Web Development' },
            { name: 'Mobile Apps' }
        ];

        for (const cat of categories) {
            await prisma.category.upsert({
                where: { name: cat.name },
                update: {},
                create: cat,
            });
        }
        console.log('Categories seeded.');

        console.log('Seeding Services...');
        const services = [
            {
                title: 'E-commerce Development',
                slug: 'ecommerce-development',
                description: 'Building scalable online stores with Next.js, React, and high-performance backends. Optimized for speed and conversion.',
                icon: 'ShoppingBagIcon'
            },
            {
                title: 'UI/UX Design',
                slug: 'ui-ux-design',
                description: 'Modern, user-centric designs that prioritize accessibility and visual excellence across all devices.',
                icon: 'PaintBrushIcon'
            },
            {
                title: 'Digital Marketing & SEO',
                slug: 'digital-marketing',
                description: 'Strategic marketing campaigns and technical SEO to boost your visibility and drive organic traffic.',
                icon: 'ChartBarIcon'
            },
            {
                title: 'Cloud Infrastructure',
                slug: 'cloud-solutions',
                description: 'Secure, resilient, and scalable cloud hosting and architecture for enterprise-level applications.',
                icon: 'CloudIcon'
            },
            {
                title: 'App Maintenance & Support',
                slug: 'app-maintenance',
                description: 'Ongoing technical support, performance monitoring, and security updates for your digital products.',
                icon: 'CogIcon'
            }
        ];

        for (const service of services) {
            await prisma.service.upsert({
                where: { slug: service.slug },
                update: {},
                create: service,
            });
        }
        console.log('Services seeded.');

        console.log('Seeding Technologies...');
        const technologies = [
            { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
            { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
            { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original-wordmark.svg' },
            { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
            { name: 'Prisma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg' },
            { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
            { name: 'MySQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
            { name: 'Vercel', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg' },
            { name: 'WordPress', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg' },
            { name: 'PHP', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' }
        ];

        for (const tech of technologies) {
            await prisma.technology.upsert({
                where: { name: tech.name },
                update: { icon: tech.icon },
                create: tech,
            });
        }
        console.log('Technologies seeded.');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
