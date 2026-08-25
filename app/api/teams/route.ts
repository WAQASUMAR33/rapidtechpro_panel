import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const getBaseUrl = (request: NextRequest) => {
    return process.env.NEXT_PUBLIC_RAPIDTECH_API_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
};

const formatMemberImage = (member: any, baseUrl: string) => {
    let img = member.image;
    if (img && img.startsWith('/uploads/')) {
        img = `${baseUrl}${img}`;
    } else if (img && img.startsWith('/team/')) {
        img = `https://rapidtechpro.com${img}`;
    }
    return {
        ...member,
        image: img,
    };
};

export async function GET(request: NextRequest) {
    try {
        const baseUrl = getBaseUrl(request);
        const teams = await prisma.teamMember.findMany({
            orderBy: { createdAt: 'desc' },
        });
        const formattedTeams = teams.map(t => formatMemberImage(t, baseUrl));
        return NextResponse.json({ success: true, data: formattedTeams });
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
