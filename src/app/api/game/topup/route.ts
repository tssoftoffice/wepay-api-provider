import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculateDefaultPartnerSellPrice } from '@/config/pricing'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'CUSTOMER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { gameId, priceId, playerId = '0000000000', server } = body
        const userId = (session as any).userId

        // Fetch Customer and Partner
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { customer: { include: { partner: true } } }
        })

        if (!user || !user.customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        const partner = user.customer.partner
        if (partner.subscriptionStatus !== 'ACTIVE') {
            return NextResponse.json({ error: 'Store subscription expired' }, { status: 403 })
        }

        const game = await prisma.game.findUnique({
            where: { id: gameId }
        })

        if (!game) {
            return NextResponse.json({ error: 'Game item not found' }, { status: 404 })
        }

        const partnerPrice = await prisma.partnerGamePrice.findUnique({
            where: {
                partnerId_gameId: {
                    partnerId: partner.id,
                    gameId: game.id
                }
            }
        })

        let sellPrice: number
        if (partnerPrice) {
            sellPrice = Number(partnerPrice.sellPrice)
        } else {
            // Default pricing fallback
            sellPrice = calculateDefaultPartnerSellPrice(Number(game.baseCost))
        }
        const baseCost = game.baseCost

        // Check Balances
        if (user.customer.walletBalance.lt(sellPrice)) {
            return NextResponse.json({ error: 'Insufficient customer balance' }, { status: 400 })
        }

        if (partner.walletBalance.lt(baseCost)) {
            return NextResponse.json({ error: 'Store temporarily unavailable (Insufficient store credit)' }, { status: 503 })
        }

        // Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Deduct Customer Balance
            await tx.customer.update({
                where: { id: user.customer!.id },
                data: { walletBalance: { decrement: sellPrice } }
            })

            // Deduct Partner Balance
            await tx.partner.update({
                where: { id: partner.id },
                data: { walletBalance: { decrement: baseCost } }
            })

            // Create Transaction Record
            const txn = await tx.gameTopupTransaction.create({
                data: {
                    customerId: user.customer!.id,
                    partnerId: partner.id,
                    gameId: game.id,
                    baseCost: baseCost,
                    sellPrice: sellPrice,
                    status: 'PENDING',
                    // @ts-ignore
                    server: server,
                }
            })

            return txn
        })

        // Call WePay API
        try {
            const { WePayClient } = await import('@/lib/wepay')

            // Parse type and company from game code (Format: TYPE_COMPANY_PRICE)
            // e.g., mtopup_12CALL_10 -> type: mtopup, company: 12CALL
            // Fallback for legacy codes or if format doesn't match
            let type = 'mtopup'
            let companyId = game.code

            if (game.code.includes('_')) {
                const parts = game.code.split('_')
                if (parts.length >= 3) {
                    type = parts[0]
                    companyId = parts[1]
                } else {
                    // Legacy format: COMPANY_PRICE
                    companyId = parts[0]
                }
            }

            const wepayRes = await WePayClient.makePayment({
                destRef: Date.now().toString(),
                type: type as any,
                amount: Number(baseCost),
                company: companyId,
                ref1: playerId,
                ref2: server || undefined
            })

            // Update with WePay Transaction ID
            await prisma.gameTopupTransaction.update({
                where: { id: result.id },
                data: {
                    providerTxnId: String(wepayRes.transactionId)
                }
            })

            return NextResponse.json({ success: true, transactionId: result.id })

        } catch (error: any) {
            console.error('WePay Error:', error)
            if (error.response) {
                console.error('WePay Response Status:', error.response.status)
                console.error('WePay Response Data:', JSON.stringify(error.response.data, null, 2))
            }

            // Refund
            await prisma.$transaction([
                prisma.customer.update({
                    where: { id: user.customer!.id },
                    data: { walletBalance: { increment: sellPrice } }
                }),
                prisma.partner.update({
                    where: { id: partner.id },
                    data: { walletBalance: { increment: baseCost } }
                }),
                prisma.gameTopupTransaction.update({
                    where: { id: result.id },
                    data: { status: 'FAILED' }
                })
            ])

            const errorMessage = error.response?.data?.desc || error.message
            return NextResponse.json({ error: 'Topup failed at provider: ' + errorMessage }, { status: 500 })
        }

    } catch (error: any) {
        console.error('Game Topup error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
