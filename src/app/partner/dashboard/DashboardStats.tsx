import React from 'react'
import prisma from '@/lib/prisma'
import styles from './stats.module.css'

async function getStats(partnerId: string) {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

    // 1. Transaction Stats (Revenue & Profit)
    const transactions = await prisma.gameTopupTransaction.findMany({
        where: {
            partnerId
        },
        include: {
            game: {
                select: { code: true, name: true, baseCost: true }
            }
        },
        orderBy: { createdAt: 'desc' } // Get distinct latest for recent transactions if needed
    })

    // Calculate totals
    let totalRevenue = 0
    let monthlyRevenue = 0
    let dailyRevenue = 0
    let dailyProfit = 0
    let profit = 0

    // Status Counts
    let successCount = 0
    let failCount = 0
    let pendingCount = 0

    // Group for Pie Chart (Top Games)
    const gameSales: Record<string, number> = {}

    // Group for Area Chart (Revenue 7 days) and Bar Chart (Volume 7 days)
    const revenueHistory: Record<string, number> = {}
    const volumeHistory: Record<string, number> = {}

    // Group for Monthly Revenue (Last 6 months)
    const monthlyRevenueHistory: Record<string, number> = {}

    // Initialize last 7 days keys
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        revenueHistory[key] = 0
        volumeHistory[key] = 0
    }

    // Initialize last 6 months keys
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
        monthlyRevenueHistory[key] = 0
    }

    transactions.forEach(tx => {
        const txDate = new Date(tx.createdAt)
        const dateKey = tx.createdAt.toISOString().split('T')[0]
        const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`

        // Volume Stats (All Status)
        if (volumeHistory[dateKey] !== undefined) {
            volumeHistory[dateKey] += 1
        }

        // Status Stats
        if (tx.status === 'SUCCESS' || tx.status === 'SUCCEEDED') successCount++
        else if (tx.status === 'PENDING') pendingCount++
        else failCount++

        // Revenue Stats (Only Success)
        if (tx.status === 'SUCCESS' || tx.status === 'SUCCEEDED') {
            const revenue = Number(tx.sellPrice)
            const cost = Number(tx.baseCost)
            const realProfit = revenue - cost

            totalRevenue += revenue
            profit += realProfit

            if (txDate >= firstDayOfMonth) {
                monthlyRevenue += revenue
            }
            if (dateKey === now.toISOString().split('T')[0]) {
                dailyRevenue += revenue
                dailyProfit += realProfit
            }

            // Pie Chart Data (Only Success Sales)
            let groupName = 'Other'
            if (tx.game.code.includes('FREEFIRE')) groupName = 'Free Fire'
            else if (tx.game.code.includes('ROV')) groupName = 'ROV'
            else if (tx.game.code.includes('GENSHIN')) groupName = 'Genshin'
            else if (tx.game.code.includes('PUBG')) groupName = 'PUBG'
            else if (tx.game.code.includes('VALORANT')) groupName = 'Valorant'

            gameSales[groupName] = (gameSales[groupName] || 0) + 1

            // Revenue History (Daily)
            if (revenueHistory[dateKey] !== undefined) {
                revenueHistory[dateKey] += revenue
            }

            // Revenue History (Monthly)
            if (monthlyRevenueHistory[monthKey] !== undefined) {
                monthlyRevenueHistory[monthKey] += revenue
            }
        }
    })

    // 2. Partner Stats (Moved up as Members are removed)
    const partner = await prisma.partner.findUnique({
        where: { id: partnerId },
        select: { walletBalance: true, subscriptionStatus: true }
    })

    return {
        financials: {
            daily: dailyRevenue,
            dailyProfit: dailyProfit,
            monthly: monthlyRevenue,
            total: totalRevenue,
            profit: profit
        },
        partner: partner,
        charts: {
            pie: Object.entries(gameSales).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
            revenueArea: Object.entries(revenueHistory).map(([name, value]) => ({ name, value })),
            revenueMonthly: Object.entries(monthlyRevenueHistory).map(([name, value]) => ({ name, value })),
            volumeBar: Object.entries(volumeHistory).map(([name, value]) => ({ name, value })),
            statusPie: [
                { name: 'สำเร็จ', value: successCount, color: '#10b981' },
                { name: 'รอชำระ', value: pendingCount, color: '#f59e0b' },
                { name: 'ไม่สำเร็จ', value: failCount, color: '#ef4444' }
            ].filter(item => item.value > 0)
        }
    }
}

export async function DashboardStats({ partnerId }: { partnerId: string }) {
    const stats = await getStats(partnerId)
    const { financials, partner } = stats

    return (
        <>
            {/* Stats Cards */}
            <div className={styles.grid}>
                {/* Wallet Balance (Restored) */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>ยอดเงินคงเหลือ</span>
                        <span className={styles.icon}>฿</span>
                    </div>
                    <div className={styles.cardValue}>฿{Number(partner?.walletBalance || 0).toLocaleString()}</div>
                    <a href="/partner/topup" className={styles.statLink}>เติมเครดิต →</a>
                </div>

                {/* Subscription Status (Restored) */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>สถานะสมาชิก</span>
                        <span className={styles.icon}>🔒</span>
                    </div>
                    <div className={styles.cardValue}>{partner?.subscriptionStatus || 'INACTIVE'}</div>
                    {partner?.subscriptionStatus !== 'ACTIVE' && (
                        <a href="/partner/subscription" className={styles.statLink}>ต่ออายุ →</a>
                    )}
                </div>

                {/* Daily Revenue (New) */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>รายได้วันนี้</span>
                        <span className={styles.icon}>☀️</span>
                    </div>
                    <div className={styles.cardValue}>฿{financials.daily.toLocaleString()}</div>
                    <div className={styles.cardSub}>ยอดขายเฉพาะวันนี้</div>
                </div>

                {/* Daily Profit (New) */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>กำไรวันนี้</span>
                        <span className={styles.icon}>📈</span>
                    </div>
                    <div className={`${styles.cardValue} ${styles.profit}`}>฿{financials.dailyProfit.toLocaleString()}</div>
                    <div className={styles.cardSub}>กำไรเฉพาะวันนี้</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>รายได้เดือนนี้</span>
                        <span className={styles.icon}>📆</span>
                    </div>
                    <div className={styles.cardValue}>฿{financials.monthly.toLocaleString()}</div>
                    <div className={styles.cardSub}>ยอดขายสะสมเดือนนี้</div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>กำไรสุทธิ</span>
                        <span className={styles.icon}>💰</span>
                    </div>
                    <div className={`${styles.cardValue} ${styles.profit}`}>฿{financials.profit.toLocaleString()}</div>
                    {/* Using cardSub properly */}
                    <div className={styles.cardSub}>คำนวณจากส่วนต่างต้นทุน</div>
                </div>

                {/* Total Revenue (Optional - moved to end or removed if too crowded, but keeping for completeness) */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span>รายได้ทั้งหมด</span>
                        <span className={styles.icon}>📊</span>
                    </div>
                    <div className={styles.cardValue}>฿{financials.total.toLocaleString()}</div>
                    <div className={styles.cardSub}>ยอดขายสะสมทั้งหมด</div>
                </div>

            </div>

            {/* Hidden Data for Client Charts */}
            <script
                id="dashboard-data"
                type="application/json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(stats.charts) }}
            />
        </>
    )
}
