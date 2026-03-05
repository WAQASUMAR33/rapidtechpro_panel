import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    console.log('Middleware hit:', request.nextUrl.pathname);

    // Only apply to /api routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        console.log('Processing API route security/CORS');
        const apiKey = request.headers.get('x-api-key');
        const validApiKey = process.env.API_KEY || 'rapidtech_secret_key_2026';

        // 1. Handle CORS Preflight (OPTIONS)
        if (request.method === 'OPTIONS') {
            console.log('Handling OPTIONS preflight');
            return new NextResponse(null, {
                status: 200, // Or 204, but 200 is often more robust for CORS
                headers: {
                    'Access-Control-Allow-Origin': '*', // Adjust if you want specific origins
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, Authorization',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        // 2. Validate API Key (Skip public/internal routes if needed, but here we secure all)
        // We skip validation for internal dashboard if needed, but usually we use a consistent key
        if (!apiKey || apiKey !== validApiKey) {
            console.log('Validation failed: Invalid or missing API key');
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Invalid or missing API key' },
                {
                    status: 401,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    }
                }
            );
        }

        console.log('Validation successful, proceeding...');
        // 3. Inject CORS headers for actual requests
        const response = NextResponse.next();
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
