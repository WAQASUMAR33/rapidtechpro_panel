import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technologyId = parseInt(params.id);

    const technology = await prisma.technology.findUnique({
      where: { id: technologyId },
      include: {
        projects: true,
      },
    });

    if (!technology) {
      return NextResponse.json(
        { error: 'Technology not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(technology);
  } catch (error) {
    console.error('Error fetching technology:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technology' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technologyId = parseInt(params.id);
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json(
        { error: 'Technology name is required' },
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

    return NextResponse.json(technology);
  } catch (error) {
    console.error('Error updating technology:', error);
    return NextResponse.json(
      { error: 'Failed to update technology' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technologyId = parseInt(params.id);

    await prisma.technology.delete({
      where: { id: technologyId },
    });

    return NextResponse.json({ message: 'Technology deleted successfully' });
  } catch (error) {
    console.error('Error deleting technology:', error);
    return NextResponse.json(
      { error: 'Failed to delete technology' },
      { status: 500 }
    );
  }
}
