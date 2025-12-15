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

        // 3. Today's date for filtering (Thailand GMT+7)
        // We want 'today' to represent 00:00:00 of the current day in Thailand
        // Current UTC time
        const now = new Date()
        // Shift to Thai time (UTC+7)
        const thaiNow = new Date(now.getTime() + (7 * 60 * 60 * 1000))
        const todayDateStr = thaiNow.toISOString().split('T')[0] // "YYYY-MM-DD" in Thai time

        let totalSales = 0 // Gross Transaction Value (sellPrice)
        let totalAdminRevenue = 0 // What admin gets (baseCost)
        let totalCost = 0 // What admin pays (providerPrice)
        let todayTxnCount = 0
        let todayAdminProfit = 0

        // Calculate monthly stats, Top Partners, and Game Distribution
        const chartStats: Record<string, { revenue: number, profit: number }> = {}
        const partnerStats: Record<string, {
            name: string,
            revenue: number, // sellPrice (Partner Revenue)
            cost: number, // baseCost (Partner Cost)
            profit: number, // sellPrice - baseCost (Partner Profit)
            adminRevenue: number, // baseCost (Partner Price)
            adminCost: number, // providerPrice (WePay Cost)
            // Logic checked and verified.
            adminProfit: number,
            txnCount: number
        }> = {}
        const gameStats: Record<string, { name: string, revenue: number, count: number }> = {}

        for (const txn of transactions) {
            const sellPrice = Number(txn.sellPrice || 0)
            const baseCost = Number(txn.baseCost || 0)
            const providerPrice = Number(txn.providerPrice || 0)

            // Admin Logic
            // adminRevenue = What Partner pays us (baseCost)
            // adminCost = What we pay WePay (providerPrice)
            const adminRevenue = baseCost
            const adminCost = providerPrice
            const adminProfit = adminRevenue - adminCost

            // Partner Logic (Reverted: baseCost is what Partner PAYS, providerPrice is WePay Cost)
            const partnerRevenue = sellPrice
            const partnerCost = baseCost
            const partnerProfit = partnerRevenue - partnerCost

            totalSales += sellPrice
            totalAdminRevenue += adminRevenue
            totalCost += adminCost

            // Check if today's transaction (using Thai Date)
            // Shift txn time to Thai time
            const txnThaiDate = new Date(txn.createdAt.getTime() + (7 * 60 * 60 * 1000))
            const txnDateStr = txnThaiDate.toISOString().split('T')[0]

            if (txnDateStr === todayDateStr) {
                todayTxnCount++
                todayAdminProfit += adminProfit
            }

            // Monthly grouping (YYYY-MM)
            const monthStr = txnDateStr.substring(0, 7) // "2025-12"
            if (!chartStats[monthStr]) {
                chartStats[monthStr] = { revenue: 0, profit: 0 }
            }
            chartStats[monthStr].revenue += sellPrice
            chartStats[monthStr].profit += adminProfit

            // Partner grouping
            const partnerId = txn.partnerId
            if (!partnerStats[partnerId]) {
                partnerStats[partnerId] = {
                    name: txn.partner.name,
                    // Partner Perspective
                    revenue: 0,
                    cost: 0,
                    profit: 0,
                    // Admin Perspective
                    adminRevenue: 0,
                    adminCost: 0,
                    adminProfit: 0,
                    txnCount: 0
                }
            }
            // Partner Stats
            partnerStats[partnerId].revenue += partnerRevenue
            partnerStats[partnerId].cost += partnerCost
            partnerStats[partnerId].profit += partnerProfit

            // Admin Stats
            partnerStats[partnerId].adminRevenue += adminRevenue
            partnerStats[partnerId].adminCost += adminCost
            partnerStats[partnerId].adminProfit += adminProfit

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

        // Format dates for chart (last 12 months)
        const chartData = Object.entries(chartStats)
            .map(([date, stats]) => ({
                date,
                revenue: stats.revenue,
                profit: stats.profit
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-12)

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

        // Get Partner Topup (Wallet Load)
        const topupTxns = await prisma.partnerTopupTransaction.findMany({
            where: { status: 'SUCCESS' }
        })
        const totalPartnerTopup = topupTxns.reduce((sum, txn) => sum + Number(txn.amount), 0)
        const totalPartnerTopupCount = topupTxns.length

        // Calculate Today's specific extra stats
        const todaySupscription = subscriptionTxns
            .filter(t => {
                // Shift to Thai time
                const d = new Date(t.createdAt.getTime() + (7 * 60 * 60 * 1000))
                return d.toISOString().split('T')[0] === todayDateStr
            })
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const todayTopup = topupTxns
            .filter(t => {
                // Shift to Thai time
                const d = new Date(t.createdAt.getTime() + (7 * 60 * 60 * 1000))
                return d.toISOString().split('T')[0] === todayDateStr
            })
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const todayTopupCount = topupTxns
            .filter(t => {
                // Shift to Thai time
                const d = new Date(t.createdAt.getTime() + (7 * 60 * 60 * 1000))
                return d.toISOString().split('T')[0] === todayDateStr
            }).length

        // Final Profit Calculations (User requested to add Subscriptions to Profit)
        const finalNetProfit = netAdminProfit + subscriptionRevenue
        const finalTodayProfit = todayAdminProfit + todaySupscription

        // 4. New Partners Today
        // Cannot use simple count because Prisma filter uses DB timezone. 
        // We fetch generic range or just fetch recent and filter in JS if simple count not sufficient with timezone.
        // Actually, for `count` with `gte` today, we need `today` variable to be start of day in UTC relative to Thai start of day.
        // Thai start of day: 00:00:00 +07 => Previous Day 17:00:00 UTC.

        // E.g. If Thai is 2025-12-11 00:00:00+07, UTC is 2025-12-10 17:00:00Z
        const thaiStartOfDay = new Date(todayDateStr + 'T00:00:00.000Z') // Create as UTC
        // But wait, todayDateStr is "2025-12-11".
        // new Date("2025-12-11T00:00:00.000Z") is 11th 00:00 UTC.
        // We want 11th 00:00 Thai Time = 10th 17:00 UTC.
        // So minus 7 hours.
        const utcStartOfThaiDay = new Date(thaiStartOfDay.getTime() - (7 * 60 * 60 * 1000))

        const newPartnersToday = await prisma.partner.count({
            // @ts-ignore: Prisma type issue with createdAt
            where: {
                createdAt: {
                    gte: utcStartOfThaiDay
                }
            }
        })

        return NextResponse.json({
            totalPartners,
            newPartnersToday, // New field
            totalRevenue: totalSales,
            netProfit: finalNetProfit,
            todayProfit: finalTodayProfit,
            totalTxnCount,
            todayTxnCount,
            chartData,
            topPartners,
            salesDistribution,
            subscriptionRevenue,
            todaySubscriptionRevenue: todaySupscription, // New field from existing var
            subscriptionCount,
            totalPartnerTopup,
            totalPartnerTopupCount,
            todayTopup,
            todayTopupCount
        })

    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
