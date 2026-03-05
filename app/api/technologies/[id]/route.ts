import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const technologyId = parseInt(id);

    const technology = await prisma.technology.findUnique({
      where: { id: technologyId },
      include: {
        projects: true,
      },
    });

    if (!technology) {
      return NextResponse.json(
        { success: false, message: 'Technology not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: technology });
  } catch (error) {
    console.error('Error fetching technology:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch technology' },
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
    const technologyId = parseInt(id);
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json(
        { success: false, message: 'Technology name is required' },
        { status: 400 }
      );
    }

    const technology = await prisma.technology.update({
      where: { id: technologyId },
      data: {
        name: data.name,
        icon: data.icon || null,
      },
      include: {
        projects: true,
      },
    });

    return NextResponse.json({ success: true, data: technology });
  } catch (error) {
    console.error('Error updating technology:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update technology' },
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
    const technologyId = parseInt(id);

    await prisma.technology.delete({
      where: { id: technologyId },
    });

    return NextResponse.json({ success: true, message: 'Technology deleted successfully' });
  } catch (error) {
    console.error('Error deleting technology:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete technology' },
      { status: 500 }
    );
  }
}
