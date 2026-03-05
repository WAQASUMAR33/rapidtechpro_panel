import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    context: { params: { id?: string } }
) {
    try {
        // Await params as required by Next.js 15+ dynamic routes
        const params = await context.params;
        const { id } = params;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Team member ID missing' }, { status: 400 });
        }

        const teamMember = await prisma.teamMember.findUnique({
            where: { id: parseInt(id) },
        });

        if (!teamMember) {
            return NextResponse.json({ success: false, message: 'Team member not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: teamMember });
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
    context: { params: { id?: string } }
) {
    try {
        const params = await context.params;
        const { id } = params;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Team member ID missing' }, { status: 400 });
        }

        const body = await request.json();
        const { name, designation, role, linkedinUrl, portfolioUrl, image } = body;

        const updatedMember = await prisma.teamMember.update({
            where: { id: parseInt(id) },
            data: {
                name,
                designation,
                role,
                linkedinUrl: linkedinUrl || null,
                portfolioUrl: portfolioUrl || null,
                image,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Team member updated successfully',
            data: updatedMember
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
    context: { params: { id?: string } }
) {
    try {
        const params = await context.params;
        const { id } = params;

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
