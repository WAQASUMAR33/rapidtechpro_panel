import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET pricing by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const pricing = await prisma.pricing.findUnique({
            where: { id: parseInt(id) },
            include: { service: { select: { id: true, title: true, slug: true } } },
        });

        if (!pricing) {
            return NextResponse.json({ success: false, message: 'Pricing not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: pricing });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch pricing' }, { status: 500 });
    }
}

// PUT update pricing by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        const updateData: any = {};

        // Only update provided fields
        const fields = [
            'serviceId',
            'standardName', 'standardPrice', 'standardPriceSuffix', 'standardFeatures', 'standardCta', 'standardIsPopular',
            'premiumName', 'premiumPrice', 'premiumPriceSuffix', 'premiumFeatures', 'premiumCta', 'premiumIsPopular',
            'customName', 'customPrice', 'customPriceSuffix', 'customPriceLabel', 'customFeatures', 'customCta', 'customIsPopular',
        ];

        for (const field of fields) {
            if (data[field] !== undefined) {
                if (field === 'serviceId') updateData[field] = parseInt(data[field]);
                else if (field === 'standardPrice' || field === 'premiumPrice' || field === 'customPrice') {
                    updateData[field] = data[field] ? parseFloat(data[field]) : null;
                } else {
                    updateData[field] = data[field];
                }
            }
        }

        const pricing = await prisma.pricing.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { service: { select: { id: true, title: true, slug: true } } },
        });

        return NextResponse.json({ success: true, data: pricing });
    } catch (error) {
        console.error('Error updating pricing:', error);
        return NextResponse.json({ success: false, message: 'Failed to update pricing' }, { status: 500 });
    }
}

// DELETE pricing by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.pricing.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true, message: 'Pricing deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to delete pricing' }, { status: 500 });
    }
}
