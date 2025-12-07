import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Mock OTP sending
        // In a real app, integrate with an email service (e.g., SendGrid, Resend)
        const otp = '123456'
        console.log(`[MOCK OTP] Sending OTP to ${email}: ${otp}`)

        return NextResponse.json({ success: true, message: 'OTP sent successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
    }
}
