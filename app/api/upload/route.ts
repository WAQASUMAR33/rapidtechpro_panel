import { NextRequest, NextResponse } from 'next/server';

const PHP_UPLOAD_URL =
    process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL ||
    'https://rapidtechpro.com/rapid_panel/uploadImage.php';

const IMAGE_BASE_URL =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
    'https://rapidtechpro.com/rapid_panel/uploads/';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file provided' },
                { status: 400 }
            );
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
                { status: 400 }
            );
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, message: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        // Convert to base64 Data URL for PHP
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        // POST base64 as JSON to PHP script
        const phpResponse = await fetch(PHP_UPLOAD_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl }),
        });

        const phpResponseText = await phpResponse.text();
        let phpData: { image_url?: string; error?: string };

        try {
            phpData = JSON.parse(phpResponseText);
        } catch {
            console.error('PHP Response:', phpResponseText.substring(0, 500));
            return NextResponse.json(
                { success: false, message: `Server error (${phpResponse.status}). Upload script returned invalid response.` },
                { status: 500 }
            );
        }

        if (phpData.error) {
            return NextResponse.json({ success: false, message: phpData.error }, { status: 500 });
        }

        if (!phpData.image_url) {
            return NextResponse.json({ success: false, message: 'No image URL returned from server' }, { status: 500 });
        }

        const url = phpData.image_url.startsWith('http')
            ? phpData.image_url
            : `${IMAGE_BASE_URL}${phpData.image_url}`;

        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully',
            data: { filename: phpData.image_url, url }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: 'Failed to upload image' }, { status: 500 });
    }
}
