import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        categories: true,
        technologies: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        keyword: data.keyword,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        canonicalTag: data.canonicalTag || null,
        mainImage: data.mainImage,
        projectUrl: data.projectUrl,
        location: data.location,
        blog: data.blog || null,
        client: data.client || null,
        challenge: data.challenge || null,
        processSteps: data.processSteps || null,
        features: data.features || null,
        results: data.results || null,
        categories: data.categoryIds
          ? {
            connect: data.categoryIds.map((id: number) => ({ id })),
          }
          : undefined,
        technologies: data.technologyIds
          ? {
            connect: data.technologyIds.map((id: number) => ({ id })),
          }
          : undefined,
      },
      include: {
        categories: true,
        technologies: true,
        images: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
