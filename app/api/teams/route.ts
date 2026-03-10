import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const teams = await prisma.teamMember.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, data: teams });
    } catch (error: any) {
        console.error('Error fetching team members:', error);
        const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
        return NextResponse.json(
            {
                success: false,
                message: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to fetch team members',
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: isDbError ? 503 : 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, designation, role, linkedinUrl, portfolioUrl, image } = body;

        // Basic validation
        if (!name || !designation || !role || !image) {
            return NextResponse.json(
                { success: false, message: 'Name, designation, role, and image are required' },
                { status: 400 }
            );
        }

        const teamMember = await prisma.teamMember.create({
            data: {
                name,
                designation,
                role,
                linkedinUrl: linkedinUrl || null,
                portfolioUrl: portfolioUrl || null,
                image,
            },
        });

        return NextResponse.json(
            { success: true, message: 'Team member added successfully', data: teamMember },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating team member:', error);
        const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
        return NextResponse.json(
            {
                success: false,
                message: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to add team member',
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: isDbError ? 503 : 500 }
        );
    }
}
