import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Beam Webhook received:', body)

        // Log to file
        const logPath = path.join(process.cwd(), 'webhook.log')
        await fs.appendFile(logPath, JSON.stringify(body, null, 2) + '\n---\n')

        const { referenceId, status } = body

        // Check if status is success
        const isSuccess = status === 'PAID' || status === 'SUCCESS' || status === 'COMPLETED' || status === 'SUCCEEDED'

        if (!referenceId) {
            return NextResponse.json({ error: 'Missing referenceId' }, { status: 400 })
        }

        // 1. Try to find Subscription Transaction
        const subscriptionTxn = await prisma.subscriptionTransaction.findUnique({
            where: { id: referenceId },
            include: { partner: true }
        })

        if (subscriptionTxn) {
            if (subscriptionTxn.status === 'SUCCESS') {
                return NextResponse.json({ message: 'Already processed' })
            }

            await prisma.subscriptionTransaction.update({
                where: { id: referenceId },
                data: { status: isSuccess ? 'SUCCESS' : 'FAILED' }
            })

            if (isSuccess && subscriptionTxn.partner) {
                // Update Partner Subscription
                const now = new Date()
                const currentEnd = subscriptionTxn.partner.subscriptionEnd ? new Date(subscriptionTxn.partner.subscriptionEnd) : now
                const newEnd = new Date(Math.max(now.getTime(), currentEnd.getTime()) + 30 * 24 * 60 * 60 * 1000)

                await prisma.partner.update({
                    where: { id: subscriptionTxn.partnerId },
                    data: {
                        subscriptionStatus: 'ACTIVE',
                        subscriptionEnd: newEnd
                    }
                })
                console.log(`Subscription renewed for partner ${subscriptionTxn.partnerId}`)
            }
            return NextResponse.json({ received: true })
        }

        // 2. Try to find Topup Transaction
        const topupTxn = await prisma.partnerTopupTransaction.findUnique({
            where: { id: referenceId },
            include: { partner: true }
        })

        if (topupTxn) {
            if (topupTxn.status === 'SUCCESS') {
                return NextResponse.json({ message: 'Already processed' })
            }

            await prisma.partnerTopupTransaction.update({
                where: { id: referenceId },
                data: { status: isSuccess ? 'SUCCESS' : 'FAILED' }
            })

            if (isSuccess && topupTxn.partner) {
                // Update Partner Wallet Balance
                await prisma.partner.update({
                    where: { id: topupTxn.partnerId },
                    data: {
                        walletBalance: {
                            increment: topupTxn.amount
                        }
                    }
                })
                console.log(`Wallet topped up for partner ${topupTxn.partnerId} amount ${topupTxn.amount}`)
            }
            return NextResponse.json({ received: true })
        }

        console.log('Transaction not found for referenceId:', referenceId)
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    } catch (error) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
    }
}
