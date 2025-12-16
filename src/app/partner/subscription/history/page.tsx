'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './page.module.css'

interface Transaction {
    id: string
    amount: number
    status: string
    createdAt: string
}

export default function SubscriptionHistoryPage() {
    const { t } = useLanguage()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/partner/subscription/history')
                const data = await res.json()
                if (data.transactions) {
                    setTransactions(data.transactions)
                }
            } catch (error) {
                console.error('Failed to fetch history:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [])

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'SUCCESS':
            case 'SUCCEEDED':
            case 'PAID':
                return styles.statusSuccess
            case 'PENDING':
                return styles.statusPending
            default:
                return styles.statusFailed
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t.subscriptionHistory.title}</h1>

            <Card className={styles.card}>
                {loading ? (
                    <div className={styles.empty}>Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className={styles.empty}>{t.subscriptionHistory.noHistory}</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{t.subscriptionHistory.date}</th>
                                    <th>{t.subscriptionHistory.amount}</th>
                                    <th>{t.subscriptionHistory.status}</th>
                                    <th>{t.subscriptionHistory.validUntil}</th>
                                    <th>{t.subscriptionHistory.referenceId}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn) => {
                                    const isSuccess = ['SUCCESS', 'SUCCEEDED', 'PAID'].includes(txn.status)
                                    let validUntil = '-'
                                    if (isSuccess) {
                                        validUntil = new Date(new Date(txn.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                    } else if (txn.status === 'PENDING') {
                                        const expiryTime = new Date(new Date(txn.createdAt).getTime() + 15 * 60 * 1000)
                                        if (expiryTime < new Date()) {
                                            validUntil = 'Expired'
                                        } else {
                                            validUntil = expiryTime.toLocaleTimeString()
                                        }
                                    }

                                    return (
                                        <tr key={txn.id}>
                                            <td>{new Date(txn.createdAt).toLocaleString()}</td>
                                            <td>{txn.amount} THB</td>
                                            <td>
                                                <span className={`${styles.status} ${getStatusClass(txn.status)}`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td>{validUntil}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                {txn.id}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}
