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

/**
 * Upload an image directly from the browser to the PHP endpoint using base64.
 * Returns the full public URL of the uploaded image.
 */
export async function uploadImageDirect(file: File): Promise<string> {
    // Convert file to base64 Data URL (e.g. "data:image/png;base64,...")
    const base64DataUrl = await fileToBase64(file);

    // Send as JSON with "image" field – PHP script decodes the base64
    const response = await fetch(PHP_UPLOAD_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64DataUrl }),
    });

    const text = await response.text();
    let data: { image_url?: string; error?: string };

    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`Upload failed: unexpected response from server (HTTP ${response.status})`);
    }

    if (data.error) {
        throw new Error(`Upload failed: ${data.error}`);
    }

    if (!data.image_url) {
        throw new Error('Upload failed: server did not return an image URL');
    }

    // Return full URL; handle case where PHP already returns a full URL
    if (data.image_url.startsWith('http')) {
        return data.image_url;
    }
    return `${IMAGE_BASE_URL}${data.image_url}`;
}
