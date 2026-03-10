import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all pricing (optionally filter by serviceId)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get('serviceId');

        const where = serviceId ? { serviceId: parseInt(serviceId) } : {};

        const pricing = await prisma.pricing.findMany({
            where,
            include: { service: { select: { id: true, title: true, slug: true } } },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: pricing });
    } catch (error: any) {
        console.error('Error fetching pricing:', error);
        const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
        return NextResponse.json(
            {
                success: false,
                message: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to fetch pricing',
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: isDbError ? 503 : 500 }
        );
    }
}

// POST create a pricing plan for a service
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.serviceId) {
            return NextResponse.json({ success: false, message: 'serviceId is required' }, { status: 400 });
        }

        const pricing = await prisma.pricing.create({
            data: {
                serviceId: parseInt(data.serviceId),

                standardName: data.standardName || 'Standard',
                standardPrice: data.standardPrice ? parseFloat(data.standardPrice) : null,
                standardPriceSuffix: data.standardPriceSuffix || 'Per Month',
                standardFeatures: data.standardFeatures || [],
                standardCta: data.standardCta || 'Book Free Consultancy',
                standardIsPopular: data.standardIsPopular || false,

                premiumName: data.premiumName || 'Premium',
                premiumPrice: data.premiumPrice ? parseFloat(data.premiumPrice) : null,
                premiumPriceSuffix: data.premiumPriceSuffix || 'Per Month',
                premiumFeatures: data.premiumFeatures || [],
                premiumCta: data.premiumCta || 'Book Free Consultancy',
                premiumIsPopular: data.premiumIsPopular || false,

                customName: data.customName || 'Custom',
                customPrice: data.customPrice ? parseFloat(data.customPrice) : null,
                customPriceSuffix: data.customPriceSuffix || 'Per Month',
                customPriceLabel: data.customPriceLabel || 'Contact Us',
                customFeatures: data.customFeatures || [],
                customCta: data.customCta || 'Book Free Consultancy',
                customIsPopular: data.customIsPopular || false,
            },
            include: { service: { select: { id: true, title: true, slug: true } } },
        });

        return NextResponse.json({ success: true, data: pricing }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating pricing:', error);
        const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
        return NextResponse.json(
            {
                success: false,
                message: isDbError ? 'Database connection failed. Please try again later.' : 'Failed to create pricing',
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: isDbError ? 503 : 500 }
        );
    }
}
