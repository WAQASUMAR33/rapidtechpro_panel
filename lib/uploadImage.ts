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
    'https://rapidtechpro.com/rapid_panel/uploadImage.php';

const IMAGE_BASE_URL =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
    'https://rapidtechpro.com/rapid_panel/uploads/';

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

    const response = await fetch('/api/upload', {
        method: 'POST',
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
