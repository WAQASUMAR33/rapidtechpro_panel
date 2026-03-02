import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const technologies = await prisma.technology.findMany({
      include: {
        projects: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(technologies);
  } catch (error) {
    console.error('Error fetching technologies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technologies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json(
        { error: 'Technology name is required' },
        { status: 400 }
      );
    }

    const technology = await prisma.technology.create({
      data: {
        name: data.name,
        icon: data.icon || null,
      },
      include: {
        projects: true,
      },
    });

    return NextResponse.json(technology, { status: 201 });
  } catch (error) {
    console.error('Error creating technology:', error);
    return NextResponse.json(
      { error: 'Failed to create technology' },
      { status: 500 }
    );
  }
}
