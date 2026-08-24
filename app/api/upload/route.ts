import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

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

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, message: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 1. Try remote PHP upload script if reachable
        const PHP_UPLOAD_URL = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL;
        const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://rapidtechpro.com/rapid_panel/uploads/';

        if (PHP_UPLOAD_URL) {
            try {
                const base64 = buffer.toString('base64');
                const dataUrl = `data:${file.type};base64,${base64}`;

                const phpResponse = await fetch(PHP_UPLOAD_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: dataUrl }),
                });

                if (phpResponse.ok) {
                    const phpText = await phpResponse.text();
                    try {
                        const phpData = JSON.parse(phpText);
                        if (phpData && phpData.image_url && !phpData.error) {
                            const url = phpData.image_url.startsWith('http')
                                ? phpData.image_url
                                : `${IMAGE_BASE_URL}${phpData.image_url}`;
                            return NextResponse.json({
                                success: true,
                                message: 'Image uploaded successfully via remote storage',
                                data: { filename: phpData.image_url, url }
                            });
                        }
                    } catch {
                        // Response was not JSON, fallback to local storage
                    }
                }
            } catch (phpErr) {
                console.warn('Remote upload endpoint unreachable, falling back to local server storage:', phpErr);
            }
        }

        // 2. Reliable Local Storage in public/uploads
        const extension = file.name.split('.').pop() || 'png';
        const cleanExt = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt || 'png'}`;

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, buffer);

        const relativeUrl = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename,
                url: relativeUrl
            }
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to upload image' }, { status: 500 });
    }
}
