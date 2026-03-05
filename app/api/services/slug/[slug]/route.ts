import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const service = await prisma.service.findUnique({
            where: { slug: slug },
        });

        if (!service) {
            return NextResponse.json(
                { success: false, message: 'Service not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: service });
    } catch (error) {
        console.error('Error fetching service by slug:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch service' },
            { status: 500 }
        );
    }
}
