import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);

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
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
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

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
