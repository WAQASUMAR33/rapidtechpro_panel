import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeGender, resolveMemberImage } from '@/lib/teamImage';

const getBaseUrl = (request: NextRequest) => {
    return process.env.NEXT_PUBLIC_RAPIDTECH_API_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
};

const formatMemberImage = (member: any, baseUrl: string) => {
    return {
        ...member,
        gender: normalizeGender(member.gender),
        image: resolveMemberImage(member.image, member.gender, baseUrl),
        hasCustomImage: Boolean(member.image && member.image.trim()),
    };
};

export async function GET(request: NextRequest) {
    try {
        const baseUrl = getBaseUrl(request);
        const teams = await prisma.teamMember.findMany({
            orderBy: [{ isCeo: 'desc' }, { createdAt: 'desc' }],
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
        const { name, designation, role, gender, isCeo, linkedinUrl, portfolioUrl, image } = body;

        // Basic validation - image is optional, a gender placeholder is used when missing
        if (!name || !designation || !role) {
            return NextResponse.json(
                { success: false, message: 'Name, designation, and role are required' },
                { status: 400 }
            );
        }

        const teamMember = await prisma.teamMember.create({
            data: {
                name,
                designation,
                role,
                gender: normalizeGender(gender),
                isCeo: Boolean(isCeo),
                linkedinUrl: linkedinUrl || null,
                portfolioUrl: portfolioUrl || null,
                image: image || null,
            },
        });

        return NextResponse.json(
            { success: true, message: 'Team member added successfully', data: formatMemberImage(teamMember, getBaseUrl(request)) },
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
