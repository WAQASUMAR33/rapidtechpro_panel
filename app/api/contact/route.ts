import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message, interests } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, message: 'Name, email, and message are required fields.' },
                { status: 400 }
            );
        }

        const emailSubject = subject || `New Inquiry from ${name} - RapidTechPro`;

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px;">
                <h2 style="color: #2dd4bf; margin: 0; font-size: 22px;">New Contact Form Submission</h2>
                <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">RapidTechPro Lead Notification</p>
            </div>

            <div style="padding: 24px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Name:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 15px;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 15px;"><a href="mailto:${email}" style="color: #0d9488; text-decoration: none;">${email}</a></td>
                    </tr>
                    ${phone ? `
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #475569;">Phone:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 15px;">${phone}</td>
                    </tr>` : ''}
                    ${interests && Array.isArray(interests) && interests.length > 0 ? `
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #475569;">Interests:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 15px;">${interests.join(', ')}</td>
                    </tr>` : ''}
                </table>

                <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-left: 4px solid #0d9488; border-radius: 4px;">
                    <p style="font-weight: bold; margin: 0 0 8px 0; color: #334155;">Message:</p>
                    <p style="margin: 0; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
                Sent from RapidTechPro Contact Form • <a href="https://rapidtechpro.com" style="color: #0d9488; text-decoration: none;">rapidtechpro.com</a>
            </div>
        </div>
        `;

        await sendEmail({
            to: process.env.NOTIFICATION_EMAIL || 'admin@rapidtechpro.com',
            replyTo: email,
            subject: emailSubject,
            html: htmlContent,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nInterests: ${Array.isArray(interests) ? interests.join(', ') : 'N/A'}\n\nMessage:\n${message}`,
        });

        return NextResponse.json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you shortly!',
        });
    } catch (error: any) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to send message.' },
            { status: 500 }
        );
    }
}
