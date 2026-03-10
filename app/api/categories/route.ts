import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        projects: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
    return NextResponse.json(
      {
        error: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to fetch categories',
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
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
      },
      include: {
        projects: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
    return NextResponse.json(
      {
        error: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to create category',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}
