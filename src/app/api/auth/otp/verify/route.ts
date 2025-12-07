import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
        }

        // Mock OTP verification
        // In a real app, verify against stored OTP (Redis/DB)
        if (otp === '123456') {
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }
}
