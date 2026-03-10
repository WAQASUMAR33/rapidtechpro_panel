import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const technologies = await prisma.technology.findMany({
      include: {
        projects: true,
      }, // Ensure DB connection is established in XAMPP
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(technologies);
  } catch (error: any) {
    console.error('Error fetching technologies:', error);
    const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
    return NextResponse.json(
      {
        error: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to fetch technologies',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: isDbError ? 503 : 500 }
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
  } catch (error: any) {
    console.error('Error creating technology:', error);
    const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
    return NextResponse.json(
      {
        error: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to create technology',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}
