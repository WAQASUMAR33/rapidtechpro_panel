/**
 * Uploads a file directly from the browser to the external PHP upload endpoint
 * using base64 encoding. URLs are read from environment variables.
 *
 * Env vars:
 *   NEXT_PUBLIC_IMAGE_UPLOAD_URL  – PHP script that accepts the upload
 *   NEXT_PUBLIC_IMAGE_BASE_URL    – Base URL where uploaded images are served
 */

const PHP_UPLOAD_URL =
    process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL ||
    'https://files.rapidtechpro.com/upload_Image.php';

const IMAGE_BASE_URL =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
    'https://files.rapidtechpro.com/uploads/';

/**
 * Convert a File to a base64 Data URL string.
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export async function uploadImageDirect(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const apiKey = process.env.NEXT_PUBLIC_RAPIDTECH_API_KEY || 'rapidtech_secret_key_2026';
    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
        },
        body: formData,
    });

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error(`Upload failed: unexpected response from server (HTTP ${response.status})`);
    }

    if (!response.ok || !data.success) {
        throw new Error(`Upload failed: ${data.message || 'Unknown error'}`);
    }

    if (!data.data || !data.data.url) {
        throw new Error('Upload failed: server did not return an image URL');
    }

    return data.data.url;
}

/**
 * Resolves an image path, relative URL, or full URL to a valid loadable URL.
 * Handles:
 *  - Full URLs: https://files.rapidtechpro.com/uploads/... -> unchanged
 *  - Relative local paths: /uploads/... -> https://files.rapidtechpro.com/uploads/...
 *  - Base filenames: 6ab25004af1ce.webp -> https://files.rapidtechpro.com/uploads/6ab25004af1ce.webp
 *  - Blob/Data URLs: blob:... / data:... -> unchanged (for instant browser previews)
 */
export function getImageUrl(imagePath?: string | null): string {
    if (!imagePath) return '';
    const trimmed = imagePath.trim();
    if (!trimmed) return '';

    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('blob:')
    ) {
        return trimmed;
    }

    const rawBaseUrl =
        process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
        'https://files.rapidtechpro.com/uploads/';
    const baseUploadsUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

    if (trimmed.startsWith('/uploads/')) {
        return `${baseUploadsUrl}${trimmed.replace(/^\/uploads\//, '')}`;
    }

    if (trimmed.startsWith('/')) {
        return trimmed;
    }

    return `${baseUploadsUrl}${trimmed}`;
}

