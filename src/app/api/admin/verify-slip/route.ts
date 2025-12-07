import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        // In real world, this should be restricted to Provider Admin or Partner Staff
        // For now, let's allow PARTNER_OWNER to verify slips for their customers
        if (!session || !['PROVIDER_ADMIN', 'PARTNER_OWNER', 'PARTNER_STAFF'].includes((session as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { requestId, status, reason } = await request.json()

        if (!requestId || !['SUCCESS', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const topupRequest = await prisma.topupRequest.findUnique({
            where: { id: requestId },
            include: { customer: true }
        })

        if (!topupRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        if (topupRequest.status !== 'PENDING') {
            return NextResponse.json({ error: 'Already processed' }, { status: 400 })
        }

        if (status === 'SUCCESS') {
            await prisma.$transaction([
                prisma.topupRequest.update({
                    where: { id: requestId },
                    data: { status: 'SUCCESS' }
                }),
                prisma.customer.update({
                    where: { id: topupRequest.customerId },
                    data: {
                        walletBalance: { increment: topupRequest.amount }
                    }
                })
            ])
        } else {
            await prisma.topupRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED', reason }
            })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Slip Verify error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
