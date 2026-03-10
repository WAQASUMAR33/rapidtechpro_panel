import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        console.log('Proxy request for path:', path);

        // We expect the path to be something like ["api", "projects"]
        // The first element should be "api"
        if (path[0] !== 'api') {
            return NextResponse.json({ success: false, message: 'Invalid proxy path' }, { status: 400 });
        }

        const target = path[1];

        // x-api-key check (Middleware already handles this, but we keep it here for extra safety if needed)
        // Actually, since middleware is active, it should have already validated the key.

        switch (target) {
            case 'projects':
                const projects = await prisma.project.findMany({
                    include: { categories: true, technologies: true },
                    orderBy: { createdAt: 'desc' },
                });
                return NextResponse.json({ success: true, data: projects });

            case 'categories':
                const categories = await prisma.category.findMany({
                    orderBy: { name: 'asc' },
                });
                return NextResponse.json(categories);

            case 'services':
                const services = await prisma.service.findMany({
                    orderBy: { createdAt: 'desc' },
                });
                return NextResponse.json({ success: true, data: services });

            case 'technologies':
                const technologies = await prisma.technology.findMany({
                    orderBy: { name: 'asc' },
                });
                return NextResponse.json(technologies);

            default:
                return NextResponse.json({ success: false, message: `Proxy target '${target}' not supported` }, { status: 404 });
        }

    } catch (error: any) {
        console.error('Proxy API error:', error);
        const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
        return NextResponse.json(
            {
                success: false,
                message: isDbError ? 'Database connection failed. Please try again later.' : 'Internal proxy error',
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: isDbError ? 503 : 500 }
        );
    }
}
