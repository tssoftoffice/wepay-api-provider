import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const auth = await validateApiKey(req)

    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { partner } = auth

    let contact = {}
    try {
        const themeConfig = JSON.parse(partner!.themeConfig || '{}')
        if (themeConfig.contact) {
            contact = themeConfig.contact
        }
    } catch (e) {
        // Ignore parsing error
    }

    // Calculate Stats
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Fetch all successful transactions for this partner
    const transactions = await prisma.gameTopupTransaction.findMany({
        where: {
            partnerId: partner!.id,
            status: { in: ['SUCCESS', 'SUCCEEDED'] }
        },
        select: {
            sellPrice: true,
            baseCost: true,
            createdAt: true
        }
    })

    let totalRevenue = 0
    let totalProfit = 0
    let dailyRevenue = 0
    let dailyProfit = 0

    for (const tx of transactions) {
        const revenue = Number(tx.sellPrice)
        const profit = Number(tx.sellPrice) - Number(tx.baseCost)

        totalRevenue += revenue
        totalProfit += profit

        if (tx.createdAt >= startOfDay) {
            dailyRevenue += revenue
            dailyProfit += profit
        }
    }

    return NextResponse.json({
        data: {
            partner_name: partner!.name,
            wallet_balance: Number(partner!.walletBalance),
            currency: 'THB',
            contact: contact,
            statistics: {
                total_revenue: totalRevenue,
                total_profit: totalProfit,
                daily_revenue: dailyRevenue,
                daily_profit: dailyProfit
            }
        }
    })
}
