import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const oldPrefixes = ['/uploads/projects/', '/uploads/'];
    const newPrefix = 'https://rapidtechpro.com/rapid_panel/uploads/';

    try {
        console.log('Starting migration...');

        // 1. Projects
        const projects = await prisma.project.findMany();
        let projectsUpdated = 0;
        for (const project of projects) {
            let updated = false;
            const data: any = {};

            const fieldsToUpdate = ['mainImage', 'bannerImage', 'projectIcon'];
            for (const field of fieldsToUpdate) {
                if ((project as any)[field]) {
                    for (const prefix of oldPrefixes) {
                        if ((project as any)[field].startsWith(prefix)) {
                            data[field] = (project as any)[field].replace(prefix, newPrefix);
                            updated = true;
                            break;
                        }
                    }
                }
            }

            if (updated) {
                await prisma.project.update({ where: { id: project.id }, data });
                projectsUpdated++;
            }
        }
        console.log(`Updated ${projectsUpdated} projects.`);

        // 2. Project Images
        const projectImages = await prisma.projectImage.findMany();
        let projectImagesUpdated = 0;
        for (const img of projectImages) {
            for (const prefix of oldPrefixes) {
                if (img.imageUrl && img.imageUrl.startsWith(prefix)) {
                    await prisma.projectImage.update({
                        where: { id: img.id },
                        data: { imageUrl: img.imageUrl.replace(prefix, newPrefix) }
                    });
                    projectImagesUpdated++;
                    break;
                }
            }
        }
        console.log(`Updated ${projectImagesUpdated} project images.`);

        // 3. Services
        const services = await prisma.service.findMany();
        let servicesUpdated = 0;
        for (const service of services) {
            let updated = false;
            const data: any = {};

            const fieldsToUpdate = ['icon', 'heroImage'];
            for (const field of fieldsToUpdate) {
                if ((service as any)[field]) {
                    for (const prefix of oldPrefixes) {
                        if ((service as any)[field].startsWith(prefix)) {
                            data[field] = (service as any)[field].replace(prefix, newPrefix);
                            updated = true;
                            break;
                        }
                    }
                }
            }

            if (updated) {
                await prisma.service.update({ where: { id: service.id }, data });
                servicesUpdated++;
            }
        }
        console.log(`Updated ${servicesUpdated} services.`);

        // 4. Technologies
        const technologies = await prisma.technology.findMany();
        let technologiesUpdated = 0;
        for (const tech of technologies) {
            if (tech.icon) {
                for (const prefix of oldPrefixes) {
                    if (tech.icon.startsWith(prefix)) {
                        await prisma.technology.update({
                            where: { id: tech.id },
                            data: { icon: tech.icon.replace(prefix, newPrefix) }
                        });
                        technologiesUpdated++;
                        break;
                    }
                }
            }
        }
        console.log(`Updated ${technologiesUpdated} technologies.`);

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
