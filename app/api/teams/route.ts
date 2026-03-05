import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const teams = await prisma.teamMember.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, data: teams });
    } catch (error) {
        console.error('Error fetching team members:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch team members' },
            { status: 500 }
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
    } catch (error) {
        console.error('Error creating team member:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to add team member' },
            { status: 500 }
        );
    }
}
