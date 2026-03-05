import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const services = await prisma.service.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, data: services });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch services' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.title || !data.description) {
            return NextResponse.json(
                { success: false, message: 'Title and description are required' },
                { status: 400 }
            );
        }

        const slug = data.slug || data.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const service = await prisma.service.create({
            data: {
                title: data.title,
                slug: slug,
                description: data.description,
                icon: data.icon || null,
                heroSubtitle: data.heroSubtitle || null,
                heroImage: data.heroImage || null,
                coreOfferings: data.coreOfferings || null,
                platformExpertise: data.platformExpertise || null,
                processSteps: data.processSteps || null,
                industries: data.industries || null,
                maintenance: data.maintenance || null,
                benefits: data.benefits || null,
                techStack: data.techStack || null,
                timeline: data.timeline || null,
                testimonials: data.testimonials || null,
                caseStudies: data.caseStudies || null,
                faq: data.faq || null,
                ctaTitle: data.ctaTitle || null,
                ctaText: data.ctaText || null,
                ctaButtonText: data.ctaButtonText || null,
            },
        });


        return NextResponse.json({ success: true, data: service }, { status: 201 });
    } catch (error) {
        console.error('Error creating service:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create service' },
            { status: 500 }
        );
    }
}
