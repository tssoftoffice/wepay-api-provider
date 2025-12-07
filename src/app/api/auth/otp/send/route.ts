import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/email'
import { randomInt } from 'crypto'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Generate 6-digit OTP
        const otp = randomInt(100000, 999999).toString()
        const expires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Store in DB: Clean up old tokens first, then create new one.
        // This ensures only one valid OTP exists per email at a time.
        await prisma.verificationToken.deleteMany({ where: { identifier: email } })

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: otp,
                expires
            }
        })

        // Send Email
        const sent = await sendOTPEmail(email, otp)

        if (!sent) {
            // Note: In dev mode without SMTP, sendOTPEmail returns true (simulated).
            // If it returns false, it means real error.
            return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' })
    } catch (error: any) {
        console.error('OTP Send Error:', error)
        return NextResponse.json({
            error: 'Failed to process request',
            details: error.message || String(error)
        }, { status: 500 })
    }
}
