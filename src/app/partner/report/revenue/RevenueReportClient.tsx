'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './report.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

interface Transaction {
    id: string
    transactionId: string | null
    createdAt: Date
    status: string
    sellPrice: any // Decimal
    baseCost: any // Decimal (Partner Cost)
    providerPrice: any // Decimal (WePay Cost)
    targetId: string | null
    game: {
        name: string
    }
}

interface Props {
    initialTransactions: Transaction[]
    initialDateRange: {
        start: string
        end: string
    }
}

export function RevenueReportClient({ initialTransactions, initialDateRange }: Props) {
    const router = useRouter()
    const { t } = useLanguage()

    const [startDate, setStartDate] = useState(initialDateRange.start)
    const [endDate, setEndDate] = useState(initialDateRange.end)
    const [isSearching, setIsSearching] = useState(false)

    // Calculate Summary Stats
    const totalRevenue = initialTransactions.reduce((sum, txn) => sum + Number(txn.sellPrice), 0)

    // Profit = Sell Price - Base Cost (Partner's Cost)
    const totalProfit = initialTransactions.reduce((sum, txn) => {
        const cost = Number(txn.baseCost) || 0
        const sell = Number(txn.sellPrice) || 0
        return sum + (sell - cost)
    }, 0)

    const handleSearch = () => {
        setIsSearching(true)
        router.push(`?startDate=${startDate}&endDate=${endDate}`)
        setIsSearching(false)
    }

    return (
        <div>
            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t.revenueReport.startDate}</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>{t.revenueReport.endDate}</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <button
                    className={styles.searchBtn}
                    onClick={handleSearch}
                    disabled={isSearching}
                >
                    {isSearching ? t.revenueReport.search + '...' : t.revenueReport.search}
                </button>
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={`${styles.card} ${styles.cardRevenue}`}>
                    <div className={styles.cardTitle}>{t.revenueReport.totalRevenue}</div>
                    <div className={styles.cardValue}>฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                </div>
                <div className={`${styles.card} ${styles.cardProfit}`}>
                    <div className={styles.cardTitle}>{t.revenueReport.totalProfit}</div>
                    <div className={styles.cardValue}>฿{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                </div>
                <div className={`${styles.card} ${styles.cardCount}`}>
                    <div className={styles.cardTitle}>{t.revenueReport.totalTxn}</div>
                    <div className={styles.cardValue}>{initialTransactions.length.toLocaleString()}</div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className={styles.tableWrapper}>
                {initialTransactions.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>{t.revenueReport.noData}</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t.revenueReport.date}</th>
                                <th>{t.revenueReport.orderId}</th>
                                <th>{t.gameTopupHistory.game}</th>
                                <th>{t.revenueReport.cost}</th>
                                <th>{t.revenueReport.sales}</th>
                                <th>{t.revenueReport.profit}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialTransactions.map((txn) => {
                                const cost = Number(txn.baseCost) || 0
                                const sell = Number(txn.sellPrice) || 0
                                const profit = sell - cost

                                return (
                                    <tr key={txn.id}>
                                        <td>
                                            {new Date(txn.createdAt).toLocaleString('th-TH', {
                                                dateStyle: 'short',
                                                timeStyle: 'short'
                                            })}
                                        </td>
                                        <td>{txn.transactionId || txn.id.substring(0, 8)}</td>
                                        <td>{txn.game.name}</td>
                                        <td>฿{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                        <td>฿{sell.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                        <td style={{ color: profit >= 0 ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                                            ฿{profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
