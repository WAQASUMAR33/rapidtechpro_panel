import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // 1. Check against environment variables if configured
        const envEmail = process.env.ADMIN_EMAIL;
        const envPassword = process.env.ADMIN_PASSWORD;

        let isAuthenticated = false;
        let adminUser: { id: number; email: string } | null = null;

        if (
            envEmail &&
            envPassword &&
            email.trim().toLowerCase() === envEmail.trim().toLowerCase() &&
            password === envPassword
        ) {
            isAuthenticated = true;
            adminUser = { id: 1, email: envEmail };
        }

        // 2. If not matched with env, verify against database
        if (!isAuthenticated) {
            try {
                const dbAdmin = await prisma.adminUser.findUnique({
                    where: { email: email.trim() },
                });

                if (dbAdmin) {
                    let isPasswordValid = false;
                    if (dbAdmin.password.startsWith('$2a$') || dbAdmin.password.startsWith('$2b$')) {
                        isPasswordValid = await bcrypt.compare(password, dbAdmin.password);
                    } else {
                        // Plain text fallback if previously saved unhashed
                        isPasswordValid = password === dbAdmin.password;
                    }

                    if (isPasswordValid) {
                        isAuthenticated = true;
                        adminUser = { id: dbAdmin.id, email: dbAdmin.email };
                    }
                }
            } catch (dbErr) {
                console.error('Database query error during login:', dbErr);
            }
        }

        if (!isAuthenticated || !adminUser) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Session response
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                id: adminUser.id,
                email: adminUser.email
            }
        });

        // Set a session cookie
        response.cookies.set('adminSession', 'true', {
            path: '/',
            httpOnly: false, // Set to true in production with proper JWT
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return response;
    } catch (error: any) {
        console.error('Login API error:', error);
        const isDbError = error.code === 'P1001' || error.message?.includes('Can\'t reach database');
        return NextResponse.json(
            {
                success: false,
                message: isDbError ? 'Database connection failed. Please try again later.' : 'Internal server error',
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: isDbError ? 503 : 500 }
        );
    }
}
