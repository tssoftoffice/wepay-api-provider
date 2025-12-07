import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'PARTNER_OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { amount } = await request.json()
        const userId = (session as any).userId

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true }
        })

        if (!user || !user.partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        // Create Topup Transaction
        const txn = await prisma.partnerTopupTransaction.create({
            data: {
                partnerId: user.partner.id,
                amount: amount,
                status: 'PENDING',
            }
        })

        // Mock Beam QR Code generation
        const beamQrUrl = `https://mock-beam.com/qr/${txn.id}?amount=${amount}`

        return NextResponse.json({
            success: true,
            paymentUrl: beamQrUrl,
            transactionId: txn.id
        })

    } catch (error: any) {
        console.error('Partner Topup error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
