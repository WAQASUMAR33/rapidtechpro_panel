import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER || 'admin@rapidtechpro.com',
        pass: process.env.SMTP_PASS || 'Rapidtechpro_786',
    },
});

export interface SendMailOptions {
    to?: string;
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
}

export async function sendEmail({ to, subject, text, html, replyTo }: SendMailOptions) {
    const fromAddress = process.env.SMTP_FROM || `"RapidTechPro" <${process.env.SMTP_USER || 'admin@rapidtechpro.com'}>`;
    const recipient = to || process.env.NOTIFICATION_EMAIL || 'admin@rapidtechpro.com';

    const info = await transporter.sendMail({
        from: fromAddress,
        to: recipient,
        replyTo: replyTo,
        subject,
        text,
        html,
    });

    return info;
}
