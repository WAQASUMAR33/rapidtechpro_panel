import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        const admin = await prisma.adminUser.findUnique({
            where: { email },
        });

        if (!admin || admin.password !== password) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // In a real production app, we would use a library like `jose` or `jsonwebtoken` 
        // to create a signed JWT and set it in a secure, httpOnly cookie.
        // For this implementation, we'll set a simple session cookie as requested.

        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                id: admin.id,
                email: admin.email
            }
        });

        // Set a session cookie
        response.cookies.set('adminSession', 'true', {
            path: '/',
            httpOnly: false, // Set to true in production with proper JWT
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return response;
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
