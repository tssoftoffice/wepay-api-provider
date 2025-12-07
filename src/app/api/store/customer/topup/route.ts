import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { amount, domain } = body

        if (!amount || amount <= 0 || !domain) {
            return NextResponse.json({ error: 'Invalid amount or domain' }, { status: 400 })
        }

        // Find partner
        const partner = await prisma.partner.findUnique({
            where: { domain }
        })

        if (!partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        // Find customer
        const customer = await prisma.customer.findFirst({
            where: {
                userId: (session as any).userId,
                partnerId: partner.id
            }
        })

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        // Create Topup Request
        const topupRequest = await prisma.topupRequest.create({
            data: {
                customerId: customer.id,
                amount: amount,
                status: 'PENDING'
            }
        })

        return NextResponse.json({ success: true, topupRequest })

    } catch (error: any) {
        console.error('Topup request error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
