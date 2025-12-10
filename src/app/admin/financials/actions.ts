'use server'

import prisma from '@/lib/prisma'

export async function getFinancialStats() {
    try {
        // 1. Game Sales
        // Revenue = providerPrice (what partner pays us)
        // Cost = baseCost (what we pay WePay)
        // Profit = providerPrice - baseCost
        const gameTxns = await prisma.gameTopupTransaction.findMany({
            where: { status: 'SUCCESS' },
            select: { providerPrice: true, baseCost: true }
        })

        let gameRevenue = 0
        let gameCost = 0

        gameTxns.forEach(tx => {
            const price = tx.providerPrice.toNumber()
            const cost = tx.baseCost.toNumber()
            gameRevenue += (price - cost) // User wants Revenue to be Net (Price - Cost)
            gameCost += cost
        })

        const gameProfit = gameRevenue // Profit is same as Net Revenue in this model

        // 2. Subscriptions
        // Revenue = amount
        // Cost = 0 (Internal feature)
        // Profit = amount
        const subTxns = await prisma.subscriptionTransaction.findMany({
            where: { status: 'SUCCESS' },
            select: { amount: true }
        })

        let subRevenue = 0
        subTxns.forEach(tx => {
            subRevenue += tx.amount.toNumber()
        })
        const subProfit = subRevenue

        // 3. Partner Topups (Liquidity check, not direct profit)
        const topupTxns = await prisma.partnerTopupTransaction.findMany({
            where: { status: 'SUCCESS' },
            select: { amount: true }
        })

        let totalTopup = 0
        topupTxns.forEach(tx => {
            totalTopup += tx.amount.toNumber()
        })

        return {
            success: true,
            data: {
                totalRevenue: subRevenue + totalTopup, // User requested to Exclude Game Revenue (Only Sub + Topup)
                totalProfit: gameProfit + subProfit, // Profit probably still includes game? User only said "Total Revenue", usually profit is total profit. I'll stick to user instructions strictly on "Revenue".
                game: {
                    revenue: gameRevenue,
                    cost: gameCost,
                    profit: gameProfit,
                    count: gameTxns.length
                },
                subscription: {
                    revenue: subRevenue,
                    cost: 0,
                    profit: subProfit,
                    count: subTxns.length
                },
                topup: {
                    total: totalTopup,
                    count: topupTxns.length
                }
            }
        }
    } catch (error) {
        console.error('Error fetching financial stats:', error)
        return { success: false, error: 'Failed to fetch statistics' }
    }
}

export async function getRecentTransactions(limit = 20) {
    try {
        // Fetch from all sources and merge
        const [gameTxns, subTxns, topupTxns] = await Promise.all([
            prisma.gameTopupTransaction.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { partner: true, game: true }
            }),
            prisma.subscriptionTransaction.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { partner: true }
            }),
            prisma.partnerTopupTransaction.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { partner: true }
            })
        ])

        const formattedGame = gameTxns.map(tx => {
            try {
                return {
                    id: tx.id,
                    type: 'GAME_SALE',
                    partner: tx.partner?.name || 'Unknown',
                    detail: `Sold ${tx.game?.name || 'Unknown Game'}`,
                    amount: tx.providerPrice?.toNumber() || 0,
                    baseCost: tx.baseCost?.toNumber() || 0,
                    providerPrice: tx.providerPrice?.toNumber() || 0,
                    profit: (tx.providerPrice?.toNumber() || 0) - (tx.baseCost?.toNumber() || 0),
                    status: tx.status,
                    date: tx.createdAt
                }
            } catch (e) {
                console.error('Error formatting game txn:', e)
                return null
            }
        }).filter(Boolean) as any[]

        const formattedSub = subTxns.map(tx => {
            try {
                return {
                    id: tx.id,
                    type: 'SUBSCRIPTION',
                    partner: tx.partner?.name || 'Unknown',
                    detail: 'Subscription Payment',
                    amount: tx.amount?.toNumber() || 0,
                    profit: tx.amount?.toNumber() || 0,
                    status: tx.status,
                    date: tx.createdAt
                }
            } catch (e) {
                return null
            }
        }).filter(Boolean) as any[]

        const formattedTopup = topupTxns.map(tx => {
            try {
                return {
                    id: tx.id,
                    type: 'TOPUP',
                    partner: tx.partner?.name || 'Unknown',
                    detail: 'Wallet Top-up',
                    amount: tx.amount?.toNumber() || 0,
                    profit: 0,
                    status: tx.status,
                    date: tx.createdAt
                }
            } catch (e) {
                return null
            }
        }).filter(Boolean) as any[]

        // Merge and sort
        const allTxns = [...formattedGame, ...formattedSub, ...formattedTopup]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit)

        return { success: true, data: allTxns }

    } catch (error: any) {
        console.error('Error fetching transactions:', error)
        return { success: false, error: error.message || 'Failed to fetch transactions' }
    }
}

// Fetch partner list with search for dropdown
export async function getPartnersAction(query?: string) {
    try {
        const where: any = {}
        if (query) {
            where.name = { contains: query } // Partial match
            // where.name = { contains: query, mode: 'insensitive' } // If Prisma supports it (Postgres/Mongo)
        }

        const partners = await prisma.partner.findMany({
            where,
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
            take: 20 // Limit results for performance (User requested 20)
        })
        return { success: true, data: partners }
    } catch (error) {
        console.error('Error fetching partners:', error)
        return { success: false, error: 'Failed' }
    }
}

// Fetch all transactions with Filtering & Pagination
export async function getTransactions(params: any) {
    try {
        const { page = 1, limit = 20, type, startDate, endDate, partnerId, status, sortBy = 'date' } = params
        const skip = (page - 1) * limit

        const where: any = {}

        // Date Range
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }

        // Status
        if (status && status !== 'ALL') {
            where.status = status
        }

        // Partner
        if (partnerId && partnerId !== 'ALL') {
            where.partnerId = partnerId
        }

        let totalCount = 0

        // Fetch from all sources
        const [gameTxns, subTxns, topupTxns] = await Promise.all([
            (!type || type === 'GAME_SALE') ? prisma.gameTopupTransaction.findMany({
                where: { ...where },
                include: { partner: true, game: true },
                orderBy: { createdAt: 'desc' },
                take: 2000 // Increased limit to allow better sorting
            }) : [],
            (!type || type === 'SUBSCRIPTION') ? prisma.subscriptionTransaction.findMany({
                where: { ...where },
                include: { partner: true },
                orderBy: { createdAt: 'desc' },
                take: 2000
            }) : [],
            (!type || type === 'TOPUP') ? prisma.partnerTopupTransaction.findMany({
                where: { ...where },
                include: { partner: true },
                orderBy: { createdAt: 'desc' },
                take: 2000
            }) : []
        ])

        const formattedGame = gameTxns.map((tx: any) => ({
            id: tx.id,
            type: 'GAME_SALE',
            detail: `Sold ${tx.game.name}`,
            partner: tx.partner.name,
            baseCost: tx.baseCost.toNumber(),
            providerPrice: tx.providerPrice.toNumber(),
            profit: tx.providerPrice.toNumber() - tx.baseCost.toNumber(),
            status: tx.status,
            date: tx.createdAt
        }))

        const formattedSub = subTxns.map((tx: any) => ({
            id: tx.id,
            type: 'SUBSCRIPTION',
            detail: 'Subscription Payment',
            partner: tx.partner.name,
            baseCost: 0,
            providerPrice: tx.amount.toNumber(),
            profit: tx.amount.toNumber(),
            status: tx.status,
            date: tx.createdAt
        }))

        const formattedTopup = topupTxns.map((tx: any) => ({
            id: tx.id,
            type: 'TOPUP',
            detail: 'Wallet Top-up',
            partner: tx.partner.name,
            baseCost: 0,
            providerPrice: tx.amount.toNumber(),
            profit: 0,
            status: tx.status,
            date: tx.createdAt
        }))

        // Merge
        let allItems = [...formattedGame, ...formattedSub, ...formattedTopup]

        // Sorting
        if (sortBy === 'partner') {
            allItems.sort((a, b) => a.partner.localeCompare(b.partner))
        } else {
            // Default Date Desc
            allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }

        totalCount = allItems.length

        // Paginate
        const paginatedItems = allItems.slice(skip, skip + Number(limit))

        return {
            success: true,
            data: paginatedItems,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / Number(limit))
            }
        }

    } catch (error) {
        console.error('Error fetching transactions:', error)
        return { success: false, error: 'Failed to fetch transactions' }
    }
}
