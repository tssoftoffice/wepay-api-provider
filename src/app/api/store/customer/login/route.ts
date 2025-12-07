import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, signToken, setSession } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { username, password, domain } = body

        if (!username || !password || !domain) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Find partner
        const partner = await prisma.partner.findUnique({
            where: { domain }
        })

        if (!partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                customer: true
            }
        })

        if (!user || !user.customer) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Check if user belongs to this partner
        if (user.customer.partnerId !== partner.id) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Check password
        const isMatch = await comparePassword(password, user.password)
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Create session
        const token = signToken({
            userId: user.id,
            username: user.username,
            role: user.role,
            partnerId: user.partnerId // For partner staff/owner
        })

        await setSession(token)

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        })

    } catch (error: any) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
