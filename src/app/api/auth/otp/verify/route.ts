import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
        }

        // Verify against DB
        const tokenRecord = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: otp
            }
        })

        if (!tokenRecord) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
        }

        // Check Expiry
        if (new Date() > tokenRecord.expires) {
            await prisma.verificationToken.delete({
                where: { identifier_token: { identifier: email, token: otp } }
            })
            return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
        }

        // Valid OTP -> Clean up
        await prisma.verificationToken.delete({
            where: { identifier_token: { identifier: email, token: otp } }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('OTP Verify Error:', error)
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }
}
