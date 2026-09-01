export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const getBaseUrl = (request: NextRequest) => {
  return process.env.NEXT_PUBLIC_RAPIDTECH_API_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
};

const formatProjectImages = (project: any, baseUrl: string) => {
  if (!project) return project;

  const resolveUrl = (url: string | null | undefined) => {
    if (!url) return url;
    if (url.startsWith('/uploads/')) {
      return `${baseUrl}${url}`;
    }
    return url;
  };

  return {
    ...project,
    mainImage: resolveUrl(project.mainImage),
    bannerImage: resolveUrl(project.bannerImage),
    brandIcon: resolveUrl(project.brandIcon),
    challengeImage1: resolveUrl(project.challengeImage1),
    challengeImage2: resolveUrl(project.challengeImage2),
    challengeImage3: resolveUrl(project.challengeImage3),
    deviceMockupScreenshot1: resolveUrl(project.deviceMockupScreenshot1),
    deviceMockupScreenshot2: resolveUrl(project.deviceMockupScreenshot2),
    deviceMockupScreenshot3: resolveUrl(project.deviceMockupScreenshot3),
    images: Array.isArray(project.images)
      ? project.images.map((img: any) => ({
          ...img,
          url: resolveUrl(img.url),
        }))
      : project.images,
  };
};

export async function GET(request: NextRequest) {
  try {
    const baseUrl = getBaseUrl(request);
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

      return NextResponse.json({ success: true, data: formatProjectImages(project, baseUrl) });
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

    const formattedProjects = projects.map((p) => formatProjectImages(p, baseUrl));
    return NextResponse.json({ success: true, data: formattedProjects });
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
        images: Array.isArray(data.images) && data.images.length > 0
          ? {
            create: data.images.map((img: string | { imageUrl: string }) => ({
              imageUrl: typeof img === 'string' ? img : img.imageUrl,
            })),
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
