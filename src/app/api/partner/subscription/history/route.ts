import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'PARTNER_OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session as any).userId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true }
        })

        if (!user?.partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        const transactions = await prisma.subscriptionTransaction.findMany({
            where: { partnerId: user.partner.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ transactions })

    } catch (error) {
        console.error('History fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
