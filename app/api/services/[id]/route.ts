import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return NextResponse.json(
                { success: false, message: 'Service not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: service });
    } catch (error) {
        console.error('Error fetching service:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch service' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);
        const data = await request.json();

        if (!data.title || !data.description) {
            return NextResponse.json(
                { success: false, message: 'Title and description are required' },
                { status: 400 }
            );
        }

        const updateData: any = {
            title: data.title,
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
        };

        if (data.slug) {
            updateData.slug = data.slug;
        }

        const service = await prisma.service.update({
            where: { id: serviceId },
            data: updateData,
        });


        return NextResponse.json({ success: true, data: service });
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update service' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const serviceId = parseInt(id);

        await prisma.service.delete({
            where: { id: serviceId },
        });

        return NextResponse.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete service' },
            { status: 500 }
        );
    }
}
