import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, subject, message, html, text, replyTo } = body;

        if (!to || !subject || (!message && !html && !text)) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: to, subject, and message (or html/text).' },
                { status: 400 }
            );
        }

        const emailHtml = html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px;">
                <h2 style="color: #2dd4bf; margin: 0; font-size: 20px;">RapidTechPro</h2>
            </div>
            <div style="padding: 24px 0; color: #1e293b; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">
                ${message || text}
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} RapidTechPro • <a href="https://rapidtechpro.com" style="color: #0d9488; text-decoration: none;">rapidtechpro.com</a>
            </div>
        </div>
        `;

        const info = await sendEmail({
            to,
            subject,
            html: emailHtml,
            text: text || message,
            replyTo,
        });

        return NextResponse.json({
            success: true,
            message: `Email successfully sent to ${to}`,
            messageId: info.messageId,
        });

    } catch (error: any) {
        console.error('Mail Send Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to send email.' },
            { status: 500 }
        );
    }
}
