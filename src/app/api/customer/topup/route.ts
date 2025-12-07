import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'CUSTOMER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { amount, slipUrl } = await request.json()
        const userId = (session as any).userId

        if (!amount || amount <= 0 || !slipUrl) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { customer: true }
        })

        if (!user || !user.customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        const topupRequest = await prisma.topupRequest.create({
            data: {
                customerId: user.customer.id,
                amount: amount,
                slipUrl: slipUrl,
                status: 'PENDING',
            }
        })

        return NextResponse.json({ success: true, requestId: topupRequest.id })

    } catch (error: any) {
        console.error('Customer Topup error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
