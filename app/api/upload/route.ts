import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

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

        const maxSize = 20 * 1024 * 1024; // 20MB input limit
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, message: 'File size must be less than 20MB' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const originalBuffer = Buffer.from(bytes);

        // Compress and convert image to WebP with optimal balance (quality 82, max 1920x1920)
        let processedBuffer: Buffer;
        let finalMimeType = 'image/webp';
        let finalExt = 'webp';

        try {
            processedBuffer = await sharp(originalBuffer)
                .rotate() // auto-orient based on EXIF
                .resize({
                    width: 1920,
                    height: 1920,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({
                    quality: 82, // Visually lossless, 70-85% size reduction
                    effort: 4,   // Fast & efficient compression
                })
                .toBuffer();
        } catch (compressionErr) {
            console.warn('Sharp compression error, falling back to original buffer:', compressionErr);
            processedBuffer = originalBuffer;
            finalMimeType = file.type;
            finalExt = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        }

        // 1. Try remote PHP upload script if reachable
        const PHP_UPLOAD_URL = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL || 'https://files.rapidtechpro.com/upload_Image.php';
        const rawBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://files.rapidtechpro.com/uploads/';
        const IMAGE_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

        if (PHP_UPLOAD_URL) {
            try {
                // 1. Try Direct Raw Binary Upload (0% Base64 overhead - fast & efficient)
                const binaryFormData = new FormData();
                const binaryBlob = new Blob([new Uint8Array(processedBuffer)], { type: finalMimeType });
                binaryFormData.append('file', binaryBlob, `image.${finalExt}`);

                let phpResponse = await fetch(PHP_UPLOAD_URL, {
                    method: 'POST',
                    body: binaryFormData,
                });

                let phpText = await phpResponse.text();
                let phpData: any = null;
                try {
                    phpData = JSON.parse(phpText);
                } catch {}

                // If remote PHP script hasn't been updated to multipart yet, fallback to JSON
                if (!phpData || !phpData.image_url) {
                    const base64 = processedBuffer.toString('base64');
                    const dataUrl = `data:${finalMimeType};base64,${base64}`;

                    phpResponse = await fetch(PHP_UPLOAD_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            image: dataUrl,
                            type: finalExt
                        }),
                    });

                    phpText = await phpResponse.text();
                    try {
                        phpData = JSON.parse(phpText);
                    } catch {}
                }

                if (phpData && phpData.image_url && !phpData.error) {
                    const url = phpData.image_url.startsWith('http')
                        ? phpData.image_url
                        : `${IMAGE_BASE_URL}${phpData.image_url}`;
                    return NextResponse.json({
                        success: true,
                        message: 'Image uploaded and converted to WebP successfully via remote storage',
                        data: { filename: phpData.image_url, url }
                    });
                } else if (phpData && phpData.error) {
                    console.warn('Remote upload returned error:', phpData.error);
                }
            } catch (phpErr) {
                console.warn('Remote upload endpoint unreachable, falling back to local server storage:', phpErr);
            }
        }

        // 2. Reliable Local Storage in public/uploads (fallback when remote PHP is unreachable)
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${finalExt}`;

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, processedBuffer);

        // Always return the canonical remote URL (https://files.rapidtechpro.com)
        const fullUrl = IMAGE_BASE_URL + filename;

        
        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename,
                url: fullUrl
            }
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to upload image' }, { status: 500 });
    }
}
