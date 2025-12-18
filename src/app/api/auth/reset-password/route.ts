import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
        }

        // 1. Verify Token
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { token },
        })

        if (!verificationToken) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
        }

        if (new Date() > verificationToken.expires) {
            await prisma.verificationToken.delete({ where: { identifier_token: { identifier: verificationToken.identifier, token } } })
            return NextResponse.json({ error: 'Token expired' }, { status: 400 })
        }

        // 2. Update User Password
        const hashedPassword = await hashPassword(password)

        // Find user by email (identifier)
        const user = await prisma.user.findFirst({
            where: { email: verificationToken.identifier }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        // 3. Delete Token
        await prisma.verificationToken.delete({
            where: { identifier_token: { identifier: verificationToken.identifier, token } }
        })

        return NextResponse.json({ message: 'Password updated successfully' })

    } catch (error: any) {
        console.error('Reset password error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
