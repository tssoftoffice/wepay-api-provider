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

        // === HANDLE WEPAY CALLBACK ===
        // WePay usually sends: dest_ref, status (00000=success), transaction_id, etc.
        // We assume 'dest_ref' is our GameTopupTransaction.id
        if (body.dest_ref) {
            const { dest_ref, status: wepayStatus, ref1, ref2 } = body

            // Check WePay Status (00000 = Success)
            const isWePaySuccess = wepayStatus === '00000'

            const gameTxn = await prisma.gameTopupTransaction.findUnique({
                where: { id: dest_ref },
                include: { partner: true, game: true }
            })

            if (gameTxn) {
                // If incoming is Success and we are already Success, check if we need to update PIN/Serial
                if (gameTxn.status === 'SUCCESS' && isWePaySuccess) {
                    // If we already have PIN/Serial, OR the incoming request doesn't have them, then we can ignore value.
                    const incomingPin = body.pin || body.card_pin || body.topup_code
                    const incomingSerial = body.serial || body.serial_no

                    if ((gameTxn.pin || !incomingPin) && (gameTxn.serial || !incomingSerial)) {
                        return NextResponse.json({ message: 'Already processed (Success)' })
                    }
                    // Otherwise, continue to update PIN/Serial
                }
                // If we are already Failed, ignore everything
                if (gameTxn.status === 'FAILED') {
                    return NextResponse.json({ message: 'Already processed (Failed)' })
                }

                // Allow transition: PENDING -> SUCCESS/FAILED
                // Allow transition: SUCCESS -> FAILED (Correction/Refund)

                const newStatus = isWePaySuccess ? 'SUCCESS' : 'FAILED'

                // Extract PIN and Serial from WePay payload (if available)
                // Common fields: pin, card_pin, serial, serial_no
                const pin = body.pin || body.card_pin || body.topup_code || null
                const serial = body.serial || body.serial_no || null

                await prisma.gameTopupTransaction.update({
                    where: { id: dest_ref },
                    data: {
                        status: newStatus,
                        providerTxnId: body.transaction_id || gameTxn.providerTxnId,
                        pin: pin ? String(pin) : undefined,
                        serial: serial ? String(serial) : undefined
                    }
                })

                if (isWePaySuccess) {
                    console.log(`Game topup success for ${gameTxn.targetId} (Txn: ${dest_ref})`)
                    // Note: Wallet was already deducted in v1/topup/route.ts.
                    // If we want to refund on failure, we should add logic here.
                } else {
                    console.log(`Game topup failed for ${gameTxn.targetId} (Txn: ${dest_ref}). WePay Status: ${wepayStatus}`)
                    // Logic for REFUND if failed (Optional but recommended)
                    // If failed, we should refund the partner.
                    if (gameTxn.status !== 'FAILED') { // Only refund once
                        await prisma.partner.update({
                            where: { id: gameTxn.partnerId },
                            data: { walletBalance: { increment: gameTxn.baseCost } }
                        })
                        console.log(`Refunded ${gameTxn.baseCost} to partner ${gameTxn.partnerId}`)
                    }
                }

                return NextResponse.json({ received: true, status: newStatus })
            }
        }

        // === EXISTING BEAM HANDLING ===
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

                // Notify Admin
                await prisma.notification.create({
                    data: {
                        title: 'Subscription Renewed',
                        message: `Partner ${subscriptionTxn.partner.name} renewed subscription`,
                        type: 'SUBSCRIPTION_RENEW'
                    }
                })
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

                // Notify Admin
                await prisma.notification.create({
                    data: {
                        title: 'Partner Wallet Topup',
                        message: `Partner ${topupTxn.partner.name} topped up ${topupTxn.amount} THB`,
                        type: 'PARTNER_TOPUP'
                    }
                })
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
