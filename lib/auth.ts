import { NextRequest } from 'next/server';

export function validateApiKey(request: NextRequest): boolean {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.API_KEY || 'rapidtech_secret_key_2026';

    console.log('--- API Key Validation ---');
    console.log('Received Key:', apiKey);
    console.log('Expected Key:', validApiKey);
    console.log('Match:', apiKey === validApiKey);

    return !!apiKey && apiKey === validApiKey;
}

export const unauthorizedResponse = {
    error: 'Unauthorized: Invalid or missing API key',
    status: 401
};
