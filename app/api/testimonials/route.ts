import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, data: testimonials });
    } catch (error: any) {
        console.error('Error fetching testimonials:', error);
        const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
        return NextResponse.json(
            {
                success: false,
                message: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to fetch testimonials',
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: isDbError ? 503 : 500 }
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
    } catch (error: any) {
        console.error('Error creating testimonial:', error);
        const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
        return NextResponse.json(
            {
                success: false,
                message: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to create testimonial',
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: isDbError ? 503 : 500 }
        );
    }
}
