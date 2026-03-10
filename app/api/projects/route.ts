import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    // If a slug is provided, return the specific project
    if (slug) {
      const project = await prisma.project.findUnique({
        where: { slug },
        include: {
          categories: true,
          technologies: true,
          images: true,
        },
      });

      if (!project) {
        return NextResponse.json(
          { success: false, message: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: project });
    }

    // Otherwise return all projects
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

    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
    return NextResponse.json(
      {
        success: false,
        message: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to fetch projects',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: isDbError ? 503 : 500 }
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
        bannerImage: data.bannerImage || null,
        projectIcon: data.projectIcon || null,
        projectUrl: data.projectUrl,
        videoUrl: data.videoUrl || null,
        location: data.location,
        shortDescription: data.shortDescription || null,
        blog: data.blog || null,
        client: data.client || null,
        strategy: data.strategy || null,
        challenge: data.challenge || null,
        challengeImage1: data.challengeImage1 || null,
        challengeImage2: data.challengeImage2 || null,
        challengeImage3: data.challengeImage3 || null,
        processSteps: data.processSteps || null,
        features: data.features || null,
        results: data.results || null,
        successPoints: data.successPoints || null,
        innovation: data.innovation || null,
        duration: data.duration || null,
        adaptableHeading: data.adaptableHeading || null,
        adaptableDescription: data.adaptableDescription || null,
        adaptableImage1: data.adaptableImage1 || null,
        adaptableImage2: data.adaptableImage2 || null,
        adaptableImage3: data.adaptableImage3 || null,
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

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
    return NextResponse.json(
      {
        success: false,
        message: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to create project',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}
