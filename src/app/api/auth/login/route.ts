import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, signToken, setSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing username or password' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const isPasswordValid = await comparePassword(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const token = signToken({ userId: user.id, role: user.role })
        await setSession(token)

        // Log User Activity
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'

        await prisma.userActivity.create({
            data: {
                userId: user.id,
                partnerId: user.partnerId,
                action: 'LOGIN',
                ipAddress: ip,
                userAgent: userAgent
            }
        })

        return NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } })

    } catch (error: any) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
