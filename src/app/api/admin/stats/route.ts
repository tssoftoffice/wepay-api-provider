import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        // TODO: Add proper Admin Authentication check here

        // 1. Total Partners
        const totalPartners = await prisma.partner.count()

        // 2. Get all successful game transactions with game info
        const transactions = await prisma.gameTopupTransaction.findMany({
            where: { status: 'SUCCESS' },
            select: {
                baseCost: true,
                sellPrice: true,
                providerPrice: true,
                createdAt: true,
                partnerId: true,
                partner: {
                    select: {
                        name: true,
                        logoUrl: true
                    }
                },
                game: {
                    select: {
                        name: true
                    }
                }
            }
        })

        // 3. Today's date for filtering
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let totalSales = 0 // Gross Transaction Value (sellPrice)
        let totalAdminRevenue = 0 // What admin gets (baseCost)
        let totalCost = 0 // What admin pays (providerPrice)
        let todayTxnCount = 0
        let todayAdminProfit = 0

        // Calculate daily stats, Top Partners, and Game Distribution
        const dailyStats: Record<string, { revenue: number, profit: number }> = {}
        const partnerStats: Record<string, {
            name: string,
            revenue: number, // sellPrice (Partner Revenue)
            cost: number, // baseCost (Partner Cost)
            profit: number, // sellPrice - baseCost (Partner Profit)
            txnCount: number
        }> = {}
        const gameStats: Record<string, { name: string, revenue: number, count: number }> = {}

        for (const txn of transactions) {
            const sellPrice = Number(txn.sellPrice || 0)
            const baseCost = Number(txn.baseCost || 0)
            const providerPrice = Number(txn.providerPrice || 0)

            // Admin Logic
            const adminRevenue = baseCost
            const adminCost = providerPrice
            const adminProfit = adminRevenue - adminCost

            // Partner Logic
            const partnerRevenue = sellPrice
            const partnerCost = baseCost
            const partnerProfit = partnerRevenue - partnerCost

            totalSales += sellPrice
            totalAdminRevenue += adminRevenue
            totalCost += adminCost

            // Check if today's transaction
            const txnDate = new Date(txn.createdAt)
            txnDate.setHours(0, 0, 0, 0)
            if (txnDate.getTime() === today.getTime()) {
                todayTxnCount++
                todayAdminProfit += adminProfit
            }

            // Daily grouping (Using Admin Stats for Chart?)
            // Usually charts show "System Growth", so maybe Sales + Admin Profit?
            // Let's stick to Sales (GTV) and Admin Profit for now.
            const date = txn.createdAt.toISOString().split('T')[0]
            if (!dailyStats[date]) {
                dailyStats[date] = { revenue: 0, profit: 0 }
            }
            dailyStats[date].revenue += sellPrice
            dailyStats[date].profit += adminProfit

            // Partner grouping
            const partnerId = txn.partnerId
            if (!partnerStats[partnerId]) {
                partnerStats[partnerId] = {
                    name: txn.partner.name,
                    revenue: 0,
                    cost: 0,
                    profit: 0,
                    txnCount: 0
                }
            }
            partnerStats[partnerId].revenue += partnerRevenue
            partnerStats[partnerId].cost += partnerCost
            partnerStats[partnerId].profit += partnerProfit
            partnerStats[partnerId].txnCount += 1

            // Game grouping for pie chart
            const gameName = txn.game?.name || 'อื่นๆ'
            if (!gameStats[gameName]) {
                gameStats[gameName] = { name: gameName, revenue: 0, count: 0 }
            }
            gameStats[gameName].revenue += sellPrice
            gameStats[gameName].count += 1
        }

        const netAdminProfit = totalAdminRevenue - totalCost
        const totalTxnCount = transactions.length

        // Format dates for chart (last 7 days)
        const chartData = Object.entries(dailyStats)
            .map(([date, stats]) => ({
                date,
                revenue: stats.revenue,
                profit: stats.profit
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7)

        // Get Top 5 Partners
        const topPartners = Object.values(partnerStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        // Get Sales Distribution by Game (top 4 + others)
        const gameList = Object.values(gameStats)
            .sort((a, b) => b.revenue - a.revenue)

        let salesDistribution: { name: string, revenue: number, percentage: number }[] = []
        if (totalSales > 0) {
            const top4 = gameList.slice(0, 4)
            const othersRevenue = gameList.slice(4).reduce((sum, g) => sum + g.revenue, 0)

            salesDistribution = top4.map(g => ({
                name: g.name,
                revenue: g.revenue,
                percentage: Math.round((g.revenue / totalSales) * 100)
            }))

            if (othersRevenue > 0) {
                salesDistribution.push({
                    name: 'อื่นๆ',
                    revenue: othersRevenue,
                    percentage: Math.round((othersRevenue / totalSales) * 100)
                })
            }
        }

        // Get Subscription Revenue
        const subscriptionTxns = await prisma.subscriptionTransaction.findMany({
            where: { status: 'SUCCESS' }
        })
        const subscriptionRevenue = subscriptionTxns.reduce((sum, txn) => sum + Number(txn.amount), 0)
        const subscriptionCount = subscriptionTxns.length

        return NextResponse.json({
            totalPartners,
            totalRevenue: totalSales, // Use Sales (GTV) for "Total Revenue" display
            netProfit: netAdminProfit,
            todayProfit: todayAdminProfit,
            totalTxnCount,
            todayTxnCount,
            chartData,
            topPartners,
            salesDistribution,
            subscriptionRevenue,
            subscriptionCount
        })

    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
