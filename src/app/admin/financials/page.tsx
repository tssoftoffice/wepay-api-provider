'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { getFinancialStats, getRecentTransactions } from './actions'
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, CreditCard, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from 'antd'

export default function FinancialsPage() {
    const [stats, setStats] = useState<any>(null)
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            const [statsRes, txRes] = await Promise.all([
                getFinancialStats(),
                getRecentTransactions()
            ])

            if (statsRes.success) setStats(statsRes.data)
            if (txRes.success) setTransactions(txRes.data || [])
            setLoading(false)
        }
        loadData()
    }, [])

    if (loading) return <div className="p-8 text-center">Loading Financial Data...</div>

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
                Financial Overview
            </h1>

            {/* Main Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>

                {/* Total Profit */}
                <Card style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Total Net Profit (กำไรสุทธิ)</p>
                            <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>
                                ฿{stats?.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </h2>
                            <p style={{ fontSize: '12px', opacity: 0.8 }}>
                                + {((stats?.game.profit || 0) + (stats?.subscription.profit || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} from Operations
                            </p>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </Card>

                {/* Total Revenue */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Total Revenue (รายรับรวม)</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0', color: '#1e293b' }}>
                                ฿{stats?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </h2>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                {/* Game Revenue excluded from Total per user request */}
                                <span style={{ color: '#3b82f6', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                                    Sub: {stats?.subscription.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                </span>
                                <span style={{ color: '#0ea5e9', background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>
                                    Top-up: {stats?.topup.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                </span>
                            </div>
                        </div>
                        <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '12px', color: '#64748b' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                </Card>

                {/* Partner Topups */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Partner Top-ups (เงินเติมเข้าระบบ)</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0', color: '#1e293b' }}>
                                ฿{stats?.topup.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </h2>
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                                {stats?.topup.count} transactions
                            </p>
                        </div>
                        <div style={{ padding: '10px', background: '#f0f9ff', borderRadius: '12px', color: '#0ea5e9' }}>
                            <CreditCard size={24} />
                        </div>
                    </div>
                </Card>

            </div>

            {/* Detailed Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <Card title="Game Sales Performance">
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748b' }}>Revenue (ยอดขายเกม)</span>
                            <span style={{ fontWeight: 600 }}>฿{stats?.game.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748b' }}>Cost (ต้นทุน WePay)</span>
                            <span style={{ fontWeight: 600, color: '#ef4444' }}>฿{stats?.game.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>Game Profit</span>
                            <span style={{ fontWeight: 700, color: '#10b981' }}>฿{stats?.game.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Subscription Performance">
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748b' }}>Revenue (ค่ารายเดือน)</span>
                            <span style={{ fontWeight: 600 }}>฿{stats?.subscription.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#64748b' }}>Cost (ต้นทุนระบบ)</span>
                            <span style={{ fontWeight: 600, color: '#ef4444' }}>฿{stats?.subscription.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>Sub Profit</span>
                            <span style={{ fontWeight: 700, color: '#10b981' }}>฿{stats?.subscription.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Recent Transactions</h3>
                    <Link href="/admin/financials/transactions">
                        <Button type="primary" size="small" ghost>View Full Report</Button>
                    </Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={{ padding: '12px', color: '#64748b', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '12px', color: '#64748b', fontWeight: 600 }}>Type</th>
                                <th style={{ padding: '12px', color: '#64748b', fontWeight: 600 }}>Detail</th>
                                <th style={{ padding: '12px', color: '#64748b', fontWeight: 600 }}>Partner</th>
                                <th style={{ padding: '12px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>WePay Cost</th>
                                <th style={{ padding: '12px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Partner Price</th>
                                <th style={{ padding: '12px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Profit</th>
                                <th style={{ padding: '12px', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx: any) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', color: '#64748b' }}>
                                        {new Date(tx.date).toLocaleDateString('th-TH')} <span style={{ fontSize: '11px' }}>{new Date(tx.date).toLocaleTimeString('th-TH')}</span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                                            background: tx.type === 'GAME_SALE' ? '#ecfdf5' : tx.type === 'TOPUP' ? '#f0f9ff' : '#fdf4ff',
                                            color: tx.type === 'GAME_SALE' ? '#059669' : tx.type === 'TOPUP' ? '#0284c7' : '#c026d3'
                                        }}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', color: '#334155' }}>{tx.detail}</td>
                                    <td style={{ padding: '12px', color: '#334155' }}>{tx.partner}</td>
                                    <td style={{ padding: '12px', textAlign: 'right', color: '#ef4444' }}>
                                        {tx.providerPrice ? `฿${tx.providerPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '-'}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>
                                        {tx.baseCost ? `฿${tx.baseCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : `฿${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right', color: tx.profit > 0 ? '#10b981' : tx.profit < 0 ? '#ef4444' : '#cbd5e1' }}>
                                        {tx.profit !== 0 ? `฿${tx.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '-'}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <span style={{
                                            color: tx.status === 'SUCCESS' ? '#10b981' : tx.status === 'FAILED' ? '#ef4444' : '#f59e0b',
                                            fontWeight: 500
                                        }}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
