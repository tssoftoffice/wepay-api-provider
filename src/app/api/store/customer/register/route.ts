import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { username, password, firstName, lastName, email, phone, domain } = body

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

        // Check if username exists
        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
        }

        // Create user and customer
        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                firstName,
                lastName,
                email,
                phone,
                role: 'CUSTOMER',
                customer: {
                    create: {
                        partnerId: partner.id,
                        walletBalance: 0
                    }
                }
            }
        })

        return NextResponse.json({ success: true, userId: user.id })
    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
