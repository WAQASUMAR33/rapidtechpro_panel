import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const testimonial = await prisma.testimonial.findUnique({
            where: { id: Number(id) },
        });

        if (!testimonial) {
            return NextResponse.json(
                { success: false, message: 'Testimonial not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: testimonial });
    } catch (error) {
        console.error('Error fetching testimonial:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch testimonial' },
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
        const body = await request.json();
        const { name, role, image, review, ratings } = body;

        const testimonial = await prisma.testimonial.update({
            where: { id: Number(id) },
            data: {
                name,
                role,
                image,
                review,
                ratings: ratings !== undefined ? Number(ratings) : undefined,
            },
        });

        return NextResponse.json({ success: true, data: testimonial });
    } catch (error) {
        console.error('Error updating testimonial:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update testimonial' },
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
        await prisma.testimonial.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({
            success: true,
            message: 'Testimonial deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete testimonial' },
            { status: 500 }
        );
    }
}
