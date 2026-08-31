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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Team member ID missing' }, { status: 400 });
        }

        const teamMember = await prisma.teamMember.findUnique({
            where: { id: parseInt(id) },
        });

        if (!teamMember) {
            return NextResponse.json({ success: false, message: 'Team member not found' }, { status: 404 });
        }

        const baseUrl = getBaseUrl(request);
        return NextResponse.json({ success: true, data: formatMemberImage(teamMember, baseUrl) });
    } catch (error) {
        console.error('Error fetching team member by ID:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch team member' },
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

        if (!id) {
            return NextResponse.json({ success: false, message: 'Team member ID missing' }, { status: 400 });
        }

        const body = await request.json();
        const { name, designation, role, gender, isCeo, linkedinUrl, portfolioUrl, image } = body;

        const updatedMember = await prisma.teamMember.update({
            where: { id: parseInt(id) },
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

        return NextResponse.json({
            success: true,
            message: 'Team member updated successfully',
            data: formatMemberImage(updatedMember, getBaseUrl(request))
        });
    } catch (error) {
        console.error('Error updating team member:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update team member' },
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

        if (!id) {
            return NextResponse.json({ success: false, message: 'Team member ID missing' }, { status: 400 });
        }

        await prisma.teamMember.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true, message: 'Team member deleted successfully' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete team member' },
            { status: 500 }
        );
    }
}
