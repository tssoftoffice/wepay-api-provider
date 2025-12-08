
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function verifySmtp() {
    console.log('Loading configuration from .env...');
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
    console.log(`SMTP_USER: ${process.env.SMTP_USER}`);

    // Mask password
    const pass = process.env.SMTP_PASS || '';
    console.log(`SMTP_PASS: ${pass.substring(0, 3)}...${pass.substring(pass.length - 2)}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');
    } catch (error: any) {
        console.error('❌ SMTP Connection Failed:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.command) console.error('Failed Command:', error.command);
        console.error('Full Error:', error);
    }
}

verifySmtp();
