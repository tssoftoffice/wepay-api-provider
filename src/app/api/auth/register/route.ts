import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, signToken, setSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Register Body:', body) // Debug Log
        const { username, password, email, role, firstName, lastName, phone, ...additionalData } = body


        if (!username || !password || !role) {
            const missing = []
            if (!username) missing.push('username')
            if (!password) missing.push('password')
            if (!role) missing.push('role')
            return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
        }

        const hashedPassword = await hashPassword(password)

        // Transaction to create User and related entities (Partner/Customer)
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    email,
                    role,
                    firstName,
                    lastName,
                    phone,
                },
            })

            if (role === 'PARTNER_OWNER') {
                const partner = await tx.partner.create({
                    data: {
                        name: additionalData.storeName || `${username}'s Store`,
                        users: {
                            connect: { id: user.id },
                        },
                    },
                })
                await tx.user.update({
                    where: { id: user.id },
                    data: { partnerId: partner.id },
                })
            } else if (role === 'CUSTOMER') {
                let partnerId = additionalData.partnerId

                if (!partnerId) {
                    // Find a default partner (e.g., the first one created)
                    const defaultPartner = await tx.partner.findFirst({
                        orderBy: { id: 'asc' } // Assuming the first partner is the main one
                    })

                    if (defaultPartner) {
                        partnerId = defaultPartner.id
                    } else {
                        // If no partner exists, create a default "Platform Store"
                        const newPartner = await tx.partner.create({
                            data: {
                                name: 'EvoPlayShop Official',
                                domain: 'official',
                                subscriptionStatus: 'ACTIVE'
                            }
                        })
                        partnerId = newPartner.id
                    }
                }

                await tx.customer.create({
                    data: {
                        userId: user.id,
                        partnerId: partnerId,
                    },
                })
            }

            return user
        })

        // Auto login after register
        const token = signToken({ userId: result.id, role: result.role })
        await setSession(token)

        return NextResponse.json({ success: true, user: { id: result.id, username: result.username, role: result.role } })

    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
