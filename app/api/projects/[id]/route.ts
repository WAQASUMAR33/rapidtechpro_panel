import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
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
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch project' },
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
    const projectId = parseInt(id);
    const data = await request.json();

    const project = await prisma.project.update({
      where: { id: projectId },
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
            set: data.categoryIds.map((id: number) => ({ id })),
          }
          : undefined,
        technologies: data.technologyIds
          ? {
            set: data.technologyIds.map((id: number) => ({ id })),
          }
          : undefined,
      },
      include: {
        categories: true,
        technologies: true,
        images: true,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update project' },
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
    const projectId = parseInt(id);

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
