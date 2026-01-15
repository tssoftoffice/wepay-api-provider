
import nodemailer from 'nodemailer'
import { SocksProxyAgent } from 'socks-proxy-agent'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function testEmailWithProxy() {
    // 1. Setup Proxy Config (Default to localhost:1080 usually used with ssh -D 1080)
    const proxyUrl = process.env.PROXY_URL || 'socks5://127.0.0.1:1080'
    console.log(`Using Proxy: ${proxyUrl}`)

    // 2. Create Agent
    const agent = new SocksProxyAgent(proxyUrl)

    // 3. Setup Transporter with Proxy Agent
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
        },
        // @ts-ignore - nodemailer types might not perfectly align with agent usage in all versions, but this is the standard way
        agent: agent
    })

    const targetEmail = 'darkvinces1423@gmail.com' // Using the email seen in your screenshot

    console.log('--------------------------------------------------')
    console.log('Testing Email via Proxy...')
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`)
    console.log(`SMTP User: ${process.env.SMTP_USER}`)
    console.log(`Pass Length: ${process.env.SMTP_PASS?.length}`)
    console.log('--------------------------------------------------')

    try {
        const info = await transporter.sendMail({
            from: `"Test Proxy" <${process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: 'Test Email via SSH Proxy',
            text: 'If you receive this, the SMTP connection via SSH Tunnel is working!',
        })

        console.log('✅ Email sent successfully!')
        console.log('Message ID:', info.messageId)
    } catch (error: any) {
        console.error('❌ Failed to send email:', error)
        if (error.response) {
            console.error('SMTP Response:', error.response)
        }
    }
}

testEmailWithProxy()
