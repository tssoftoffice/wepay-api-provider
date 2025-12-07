'use client'

import React from 'react'
import styles from './history.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

interface Transaction {
    id: string
    transactionId: string | null
    createdAt: Date
    status: string
    sellPrice: any // Decimal
    targetId: string | null // Player ID / UID
    game: {
        name: string
    }
}

interface Props {
    initialData: Transaction[]
}

export function GameHistoryClient({ initialData }: Props) {
    const { t } = useLanguage()

    if (initialData.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>{t.gameTopupHistory.noHistory}</p>
            </div>
        )
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{t.gameTopupHistory.date}</th>
                        <th>{t.gameTopupHistory.txnId}</th>
                        <th>{t.gameTopupHistory.game}</th>
                        <th>{t.gameTopupHistory.target}</th>
                        <th>{t.gameTopupHistory.amount}</th>
                        <th>{t.gameTopupHistory.status}</th>
                    </tr>
                </thead>
                <tbody>
                    {initialData.map((txn) => (
                        <tr key={txn.id}>
                            <td>
                                {new Date(txn.createdAt).toLocaleString('th-TH', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                })}
                            </td>
                            <td>
                                <span className={styles.txnId}>
                                    {txn.transactionId || txn.id.substring(0, 8)}
                                </span>
                            </td>
                            <td>{txn.game.name}</td>
                            <td>{txn.targetId || '-'}</td>
                            <td>฿{Number(txn.sellPrice).toLocaleString()}</td>
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
                    ))}
                </tbody>
            </table>
        </div>
    )
}
