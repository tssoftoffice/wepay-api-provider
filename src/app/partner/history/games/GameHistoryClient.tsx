'use client'

import React, { useState, useEffect } from 'react'
import styles from './history.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { getGameTransactions } from './actions'
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface Transaction {
    id: string
    transactionId: string | null
    createdAt: Date
    status: string
    baseCost: number
    sellPrice: number
    targetId: string | null
    game: {
        name: string
    }
}

interface Props {
    initialData?: Transaction[]
}

export function GameHistoryClient({ initialData = [] }: Props) {
    const { t } = useLanguage()

    // State
    const [data, setData] = useState<Transaction[]>(initialData)
    const [loading, setLoading] = useState(initialData.length === 0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [sortField, setSortField] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const pageSize = 20

    const fetchData = async () => {
        setLoading(true)
        const res = await getGameTransactions({
            page,
            pageSize,
            sortField,
            sortOrder
        })

        if (res.success && res.data) {
            setData(res.data)
            setTotalPages(res.totalPages || 1)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [page, sortField, sortOrder])

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('desc') // Default to desc for new field
        }
        setPage(1) // Reset to page 1 on sort change
    }

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return <ArrowUpDown size={14} style={{ opacity: 0.3, marginLeft: 6 }} />
        return sortOrder === 'asc'
            ? <ArrowUp size={14} style={{ color: '#5e35b1', marginLeft: 6 }} />
            : <ArrowDown size={14} style={{ color: '#5e35b1', marginLeft: 6 }} />
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {t.gameTopupHistory.date} {renderSortIcon('createdAt')}
                                </div>
                            </th>
                            <th>{t.gameTopupHistory.txnId}</th>
                            <th>{t.gameTopupHistory.game}</th>
                            <th>{t.gameTopupHistory.target}</th>
                            <th>Cost</th>
                            <th onClick={() => handleSort('sellPrice')} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {t.gameTopupHistory.amount} {renderSortIcon('sellPrice')}
                                </div>
                            </th>
                            <th>Profit</th>
                            <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {t.gameTopupHistory.status} {renderSortIcon('status')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && data.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={styles.emptyState}>
                                    {t.gameTopupHistory.noHistory}
                                </td>
                            </tr>
                        ) : (
                            data.map((txn, index) => (
                                <tr key={txn.id} style={{ background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                                    <td>
                                        {new Date(txn.createdAt).toLocaleString('th-TH', {
                                            dateStyle: 'short',
                                            timeStyle: 'medium'
                                        })}
                                    </td>
                                    <td>
                                        <span
                                            className={styles.txnId}
                                            title="Click to copy"
                                            onClick={() => {
                                                navigator.clipboard.writeText(txn.id)
                                                // Optional: Toast notification
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {txn.transactionId || txn.id.substring(0, 8)}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 500, color: '#334155' }}>
                                            {txn.game.name}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{txn.targetId || '-'}</td>
                                    <td style={{ color: '#64748b' }}>
                                        ฿{Number(txn.baseCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ fontWeight: 600, color: '#1e293b' }}>
                                        ฿{Number(txn.sellPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ fontWeight: 600, color: '#10b981' }}>
                                        +฿{(Number(txn.sellPrice) - Number(txn.baseCost)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>
                                        <span className={`
                                            ${styles.status}
                                            ${txn.status === 'SUCCESS' ? styles.statusSuccess :
                                                txn.status === 'PENDING' ? styles.statusPending :
                                                    styles.statusFailed}
                                        `}>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={styles.pageButton}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <span className={styles.pageInfo}>
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={styles.pageButton}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}
