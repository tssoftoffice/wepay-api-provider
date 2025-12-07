import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { transactionId, status } = body

        if (!transactionId || !status) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        const txn = await prisma.partnerTopupTransaction.findUnique({
            where: { id: transactionId },
            include: { partner: true }
        })

        if (!txn) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }

        if (txn.status === 'SUCCESS') {
            return NextResponse.json({ message: 'Already processed' })
        }

        if (status === 'success') {
            // Credit Wallet
            await prisma.$transaction([
                prisma.partnerTopupTransaction.update({
                    where: { id: txn.id },
                    data: { status: 'SUCCESS' }
                }),
                prisma.partner.update({
                    where: { id: txn.partnerId },
                    data: {
                        walletBalance: { increment: txn.amount }
                    }
                })
            ])

            console.log(`Notification: Partner ${txn.partner.name} topup ${txn.amount} success`)
        } else {
            await prisma.partnerTopupTransaction.update({
                where: { id: txn.id },
                data: { status: 'FAILED' }
            })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
