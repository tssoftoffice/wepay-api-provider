import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        // WePay sends data as form-data or urlencoded, but we need to handling content-type strictly
        const contentType = request.headers.get('content-type') || ''
        let destRef = ''
        let wepayTxnId = ''
        let status = ''

        console.log('WePay Callback Content-Type:', contentType)

        if (contentType.includes('application/json')) {
            const body = await request.json()
            destRef = body.dest_ref
            wepayTxnId = body.transaction_id
            status = body.status
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData()
            destRef = formData.get('dest_ref') as string
            wepayTxnId = formData.get('transaction_id') as string
            status = formData.get('status') as string
        } else {
            // Fallback: parse as text/urlencoded manually
            const text = await request.text()
            console.log('WePay Callback Raw Body:', text)
            const params = new URLSearchParams(text)
            destRef = params.get('dest_ref') || ''
            wepayTxnId = params.get('transaction_id') || ''
            status = params.get('status') || ''
        }

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
            const ops = []

            // Refund Customer if exists
            if (transaction.customerId) {
                ops.push(
                    prisma.customer.update({
                        where: { id: transaction.customerId },
                        data: { walletBalance: { increment: transaction.sellPrice } }
                    })
                )
            }

            // Refund Partner
            ops.push(
                prisma.partner.update({
                    where: { id: transaction.partnerId },
                    data: { walletBalance: { increment: transaction.baseCost } }
                })
            )

            // Update Txn Status
            ops.push(
                prisma.gameTopupTransaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'FAILED',
                        providerTxnId: wepayTxnId
                    }
                })
            )

            await prisma.$transaction(ops)
        }

        return new NextResponse(`SUCCEED ORDER_ID=${destRef}`)

    } catch (error) {
        console.error('WePay Callback Error:', error)
        return new NextResponse('ERROR INTERNAL_SERVER_ERROR', { status: 500 })
    }
}
