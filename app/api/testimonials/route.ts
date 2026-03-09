import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, data: testimonials });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch testimonials' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, role, image, review, ratings } = body;

        if (!name || !role || !image || !review) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        const testimonial = await prisma.testimonial.create({
            data: {
                name,
                role,
                image,
                review,
                ratings: Number(ratings) || 5,
            },
        });

        return NextResponse.json({ success: true, data: testimonial });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create testimonial' },
            { status: 500 }
        );
    }
}
