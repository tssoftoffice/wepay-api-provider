import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateApiKey } from '@/lib/api-auth'
import { WePayClient } from '@/lib/wepay'

export async function POST(req: NextRequest) {
    const auth = await validateApiKey(req)

    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { partner } = auth

    try {
        const body = await req.json()
        const { game_id, player_id, server } = body

        if (!game_id || !player_id) {
            return NextResponse.json({ error: 'Missing required fields: game_id, player_id' }, { status: 400 })
        }

        // 1. Find the game
        const game = await prisma.game.findUnique({
            where: { id: game_id }
        })

        if (!game || game.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Game not found or inactive' }, { status: 404 })
        }

        // 2. Determine cost & sell price
        const cost = Number(game.baseCost)
        let sellPrice = cost

        // Check if partner has set a custom price
        const customPrice = await prisma.partnerGamePrice.findUnique({
            where: {
                partnerId_gameId: {
                    partnerId: partner!.id,
                    gameId: game.id
                }
            }
        })

        if (customPrice) {
            sellPrice = Number(customPrice.sellPrice)
        }

        const partnerBalance = Number(partner!.walletBalance)

        if (partnerBalance < cost) {
            return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 })
        }

        // 3. Create Pending Transaction
        const transaction = await prisma.gameTopupTransaction.create({
            data: {
                partnerId: partner!.id,
                gameId: game.id,
                // customerId is optional/undefined for API
                targetId: player_id,
                baseCost: cost, // For API, baseCost from game
                providerPrice: game.providerPrice,
                sellPrice: sellPrice, // Use determined sellPrice
                status: 'PENDING',
                server: server || null
            }
        })

        // 4. Call WePay API
        try {
            // Parse company from code (e.g. mtopup_TRMV_50 -> TRMV)
            const parts = game.code.split('_')
            let company = parts[1]
            if (['mtopup', 'gtopup', 'cashcard'].includes(parts[0])) {
                company = parts[1]
            } else {
                company = parts[0] // Legacy fallback
            }

            const wePayAmount = Number(game.faceValue) || cost
            console.log('DEBUG WePay Payment:', {
                game_code: game.code,
                faceValue: game.faceValue,
                baseCost: game.baseCost,
                cost: cost,
                wePayAmount: wePayAmount,
                company: company
            })

            const wepayRes = await WePayClient.makePayment({
                destRef: transaction.id, // Use Transaction ID as Reference
                type: parts[0] as any,
                amount: wePayAmount,
                company: company,
                ref1: player_id,
                ref2: server || undefined
            })

            // 5. Update Transaction & Deduct Balance
            // Use transaction to ensure atomicity if possible, but for now sequential

            await prisma.$transaction([
                prisma.partner.update({
                    where: { id: partner!.id },
                    data: { walletBalance: { decrement: cost } }
                }),
                prisma.gameTopupTransaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'SUCCESS', // WePay is synchronous success here usually
                        providerTxnId: wepayRes.transactionId
                    }
                })
            ])

            return NextResponse.json({
                data: {
                    transaction_id: transaction.id,
                    status: 'SUCCESS',
                    game_name: game.name,
                    amount: cost,
                    remaining_balance: partnerBalance - cost
                }
            })

        } catch (error: any) {
            console.error('WePay Error:', error)

            // Mark as failed
            await prisma.gameTopupTransaction.update({
                where: { id: transaction.id },
                data: { status: 'FAILED' }
            })

            const providerError = error.response?.data
            const errorMessage = providerError?.desc || error.message || 'Upstream Provider Error'
            const errorCode = providerError?.code || 'PROVIDER_ERROR'

            return NextResponse.json({
                success: false,
                error: {
                    code: errorCode,
                    message: errorMessage,
                    transaction_id: transaction.id,
                    details: providerError // Keep original details just in case
                }
            }, { status: 502 })
        }

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Internal Server Error'
            }
        }, { status: 500 })
    }
}
