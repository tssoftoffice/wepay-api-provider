import React from 'react'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import styles from './stats.module.css'
import { Wallet, ShoppingCart, Activity, ShieldCheck, DollarSign, BarChart2, Calendar } from 'lucide-react'

async function getStats(partnerId: string) {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // 1. Transaction Stats (Revenue & Profit)
    const transactions = await prisma.gameTopupTransaction.findMany({
        where: { partnerId },
        include: { game: { select: { code: true, name: true, baseCost: true } } },
        orderBy: { createdAt: 'desc' }
    })

    // Calculate totals
    let totalRevenue = 0
    let monthlyRevenue = 0
    let dailyRevenue = 0
    let dailyProfit = 0
    let profit = 0
    let successCount = 0
    let failCount = 0
    let pendingCount = 0

    // Group for Charts
    const gameSales: Record<string, number> = {}
    const revenueHistory: Record<string, number> = {}
    const volumeHistory: Record<string, number> = {}
    const monthlyRevenueHistory: Record<string, number> = {}

    // Init keys
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        revenueHistory[key] = 0
        volumeHistory[key] = 0
    }
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthlyRevenueHistory[key] = 0
    }

    transactions.forEach(tx => {
        const txDate = new Date(tx.createdAt)
        const dateKey = tx.createdAt.toISOString().split('T')[0]
        const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`

        if (volumeHistory[dateKey] !== undefined) volumeHistory[dateKey] += 1

        if (tx.status === 'SUCCESS' || tx.status === 'SUCCEEDED') successCount++
        else if (tx.status === 'PENDING') pendingCount++
        else failCount++

        if (tx.status === 'SUCCESS' || tx.status === 'SUCCEEDED') {
            const revenue = Number(tx.sellPrice)
            const cost = Number(tx.baseCost) || 0
            const realProfit = revenue - cost

            totalRevenue += revenue
            profit += realProfit

            if (txDate >= firstDayOfMonth) monthlyRevenue += revenue
            if (dateKey === now.toISOString().split('T')[0]) {
                dailyRevenue += revenue
                dailyProfit += realProfit
            }

            // Pie Chart Data
            let groupName = 'Other'
            if (tx.game.code.includes('FREEFIRE')) groupName = 'Free Fire'
            else if (tx.game.code.includes('ROV')) groupName = 'ROV'
            else if (tx.game.code.includes('GENSHIN')) groupName = 'Genshin'
            else if (tx.game.code.includes('PUBG')) groupName = 'PUBG'
            else if (tx.game.code.includes('VALORANT')) groupName = 'Valorant'
            gameSales[groupName] = (gameSales[groupName] || 0) + 1

            if (revenueHistory[dateKey] !== undefined) revenueHistory[dateKey] += revenue
            if (monthlyRevenueHistory[monthKey] !== undefined) monthlyRevenueHistory[monthKey] += revenue
        }
    })

    const partner = await prisma.partner.findUnique({
        where: { id: partnerId },
        select: { walletBalance: true, subscriptionStatus: true }
    })

    return {
        financials: { daily: dailyRevenue, dailyProfit, monthly: monthlyRevenue, total: totalRevenue, profit },
        partner,
        charts: {
            pie: Object.entries(gameSales).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
            revenueArea: Object.entries(revenueHistory).map(([name, value]) => ({ name, value })),
            revenueMonthly: Object.entries(monthlyRevenueHistory).map(([name, value]) => ({ name, value })),
            volumeBar: Object.entries(volumeHistory).map(([name, value]) => ({ name, value })),
            statusPie: [{ name: 'สำเร็จ', value: successCount, color: '#10b981' }, { name: 'รอชำระ', value: pendingCount, color: '#f59e0b' }, { name: 'ไม่สำเร็จ', value: failCount, color: '#ef4444' }].filter(item => item.value > 0)
        }
    }
}

export async function DashboardStats({ partnerId }: { partnerId: string }) {
    const stats = await getStats(partnerId)
    const { financials, partner } = stats

    return (
        <>
            <div className={styles.grid}>
                {/* 1. Purple Card: Wallet Balance (Main Asset) */}
                <div className={`${styles.card} ${styles.cardPurple}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconBox} style={{ background: '#5e35b1', color: 'white' }}>
                            <Wallet size={20} />
                        </div>
                        <div style={{ marginLeft: 'auto', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem' }}>
                            {partner?.subscriptionStatus || 'INACTIVE'}
                        </div>
                    </div>
                    <div>
                        <div className={styles.cardValue}>฿{Number(partner?.walletBalance || 0).toLocaleString()}</div>
                        <div className={styles.cardTitle}>ยอดเงินคงเหลือ</div>
                    </div>
                    <a href="/partner/topup" className={styles.link}>เติมเครดิต →</a>
                </div>

                {/* 2. Blue Card: Net Profit (The Goal) */}
                <div className={`${styles.card} ${styles.cardBlue}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconBox} style={{ background: '#1565c0', color: 'white' }}>
                            <Activity size={20} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.cardValue}>฿{financials.profit.toLocaleString()}</div>
                        <div className={styles.cardTitle}>กำไรสุทธิทั้งหมด</div>
                    </div>
                    <div className={styles.cardSub}>Margin from Sales</div>
                </div>

                {/* 3. Side Column: Quick Stats (Daily Rev, Sub Status) */}
                <div className={styles.sideColumn}>
                    {/* Top: Daily Revenue (Blue Gradient) */}
                    <div className={styles.sideCard}>
                        <div className={styles.iconBox} style={{ background: '#0d47a1' }}>
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>฿{financials.daily.toLocaleString()}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>รายได้วันนี้</div>
                        </div>
                    </div>

                    {/* Bottom: Monthly Revenue (White) */}
                    <div className={`${styles.sideCard} ${styles.sideCardWhite}`} style={{ background: 'white', color: '#1e293b' }}>
                        <div className={styles.iconBox} style={{ background: '#eff6ff', color: '#1e88e5' }}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>฿{financials.monthly.toLocaleString()}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>รายได้เดือนนี้</div>
                        </div>
                    </div>
                </div>

                {/* 4. Bottom Row: White Generic Cards (Details) */}
                <div className={`${styles.card} ${styles.cardWhite}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconBox}>
                            <BarChart2 size={20} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.cardValue}>฿{financials.dailyProfit.toLocaleString()}</div>
                        <div className={styles.cardTitle}>กำไรวันนี้</div>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.cardWhite}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconBox}>
                            <ShoppingCart size={20} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.cardValue}>฿{financials.total.toLocaleString()}</div>
                        <div className={styles.cardTitle}>ยอดขายสะสม</div>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.cardWhite}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconBox}>
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    <div>
                        <div className={styles.cardValue} style={{ fontSize: '1.5rem', marginTop: 8 }}>{partner?.subscriptionStatus || 'INACTIVE'}</div>
                        <div className={styles.cardTitle}>สถานะสมาชิก</div>
                    </div>
                    {partner?.subscriptionStatus !== 'ACTIVE' && (
                        <a href="/partner/subscription" className={styles.link} style={{ color: '#3b82f6', marginTop: 4, display: 'block' }}>ต่ออายุ →</a>
                    )}
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
