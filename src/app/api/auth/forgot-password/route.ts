import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // 1. Check if user exists
        const user = await prisma.user.findFirst({
            where: { email },
        })

        if (!user) {
            return NextResponse.json({ error: 'ไม่พบอีเมลนี้ในระบบ' }, { status: 404 })
        }

        // 2. Generate Token
        const token = uuidv4()
        const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

        // 3. Save to VerificationToken
        // Check if token exists for this email, delete old ones
        await prisma.verificationToken.deleteMany({
            where: { identifier: email }
        })

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires
            }
        })

        // 4. Send Email
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
        const emailSent = await sendPasswordResetEmail(email, resetLink)

        if (!emailSent) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        // DEV/DEMO MODE: Return the link if no real email was sent (implied by lack of SMTP config handling in lib)
        // OR explicit check for dev environment
        if (process.env.NODE_ENV !== 'production') {
            return NextResponse.json({ message: 'Reset link sent', debugLink: resetLink })
        }

        return NextResponse.json({ message: 'Reset link sent' })

    } catch (error: any) {
        console.error('Forgot password error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
