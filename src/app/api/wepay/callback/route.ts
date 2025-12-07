import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        // WePay sends data as form-data or urlencoded
        const formData = await request.formData()
        const destRef = formData.get('dest_ref') as string
        const wepayTxnId = formData.get('transaction_id') as string
        const status = formData.get('status') as string // 2 = Success, 4 = Failed

        console.log('WePay Callback:', { destRef, wepayTxnId, status })

        if (!destRef) {
            return new NextResponse('ERROR INVALID_REF', { status: 400 })
        }

        const transaction = await prisma.gameTopupTransaction.findUnique({
            where: { id: destRef },
            include: { customer: true, partner: true }
        })

        if (!transaction) {
            return new NextResponse('ERROR TXN_NOT_FOUND', { status: 404 })
        }

        if (transaction.status !== 'PENDING') {
            // Already processed
            return new NextResponse(`SUCCEED ORDER_ID=${destRef}`)
        }

        if (status === '2') {
            // Success
            await prisma.gameTopupTransaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'SUCCESS',
                    providerTxnId: wepayTxnId
                }
            })
        } else {
            // Failed - Refund
            await prisma.$transaction([
                // Refund Customer
                prisma.customer.update({
                    where: { id: transaction.customerId },
                    data: { walletBalance: { increment: transaction.sellPrice } }
                }),
                // Refund Partner
                prisma.partner.update({
                    where: { id: transaction.partnerId },
                    data: { walletBalance: { increment: transaction.baseCost } }
                }),
                // Update Txn Status
                prisma.gameTopupTransaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'FAILED',
                        providerTxnId: wepayTxnId
                    }
                })
            ])
        }

        return new NextResponse(`SUCCEED ORDER_ID=${destRef}`)

    } catch (error) {
        console.error('WePay Callback Error:', error)
        return new NextResponse('ERROR INTERNAL_SERVER_ERROR', { status: 500 })
    }
}
