'use client'

import { useEffect, useState } from 'react'
import { getPartnerDetails } from '../actions'
import { ArrowLeft, User, Building2, Wallet, CheckCircle, Clock, CreditCard, ExternalLink, Settings, Save } from 'lucide-react'
import Link from 'next/link'
import styles from './detail.module.css'

export default function PartnerDetailPage({ params }: { params: { id: string } }) {
    const [partner, setPartner] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        const fetchDetails = async () => {
            const res = await getPartnerDetails(params.id)
            if (res.success) {
                setPartner(res.data)
            }
            setLoading(false)
        }
        fetchDetails()
    }, [params.id])

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
    if (!partner) return <div style={{ padding: 40, textAlign: 'center' }}>Partner not found</div>

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/admin/partners" className={styles.backButton}>
                    <ArrowLeft size={20} />
                </Link>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h1 className={styles.title}>{partner.name}</h1>
                        <span className={styles.badge}>{partner.subscriptionStatus}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: '#64748b' }}>
                        <span>ID: {partner.id}</span>
                        <span>•</span>
                        <span>สมัครเมื่อ: {new Date(partner.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                </div>
                <div className={styles.walletCard}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Wallet Balance</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>฿{partner.walletBalance.toLocaleString()}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'transactions' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    Transactions
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'overview' && (
                <div className={styles.grid}>
                    {/* Stats */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>สถิติร้านค้า</h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>ยอดขายรวม</div>
                                <div className={styles.statValue}>{partner._count.gameTopups} รายการ</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>ลูกค้าทั้งหมด</div>
                                <div className={styles.statValue}>{partner._count.customers} คน</div>
                            </div>
                        </div>
                    </div>

                    {/* Admin User info */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>ผู้ดูแลระบบ</h3>
                        {partner.users.map((u: any) => (
                            <div key={u.id} className={styles.userItem}>
                                <div className={styles.userAvatar}>
                                    <User size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{u.username}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Game</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partner.recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>ไม่มีรายการล่าสุด</td>
                                </tr>
                            ) : (
                                partner.recentTransactions.map((tax: any) => (
                                    <tr key={tax.id}>
                                        <td>{new Date(tax.createdAt).toLocaleString('th-TH')}</td>
                                        <td>{tax.game.name}</td>
                                        <td>{tax.customer?.userId?.slice(0, 8)}...</td>
                                        <td>฿{tax.sellPrice.toLocaleString()}</td>
                                        <td>
                                            <span style={{
                                                color: tax.status === 'SUCCESS' ? '#166534' : '#b45309',
                                                background: tax.status === 'SUCCESS' ? '#dcfce7' : '#fef3c7',
                                                padding: '2px 8px', borderRadius: 4, fontSize: 12
                                            }}>
                                                {tax.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>ตั้งค่าร้านค้า</h3>
                    <div style={{ padding: '20px 0', color: '#64748b', textAlign: 'center' }}>
                        Coming Soon: Edit Name, Domain, Webhook
                    </div>
                </div>
            )}

        </div>
    )
}
