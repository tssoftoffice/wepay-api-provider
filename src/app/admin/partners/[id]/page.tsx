'use client'

import { useEffect, useState, use } from 'react'
import { getPartnerDetails, updatePartner } from '../actions'
import { ArrowLeft, User, Building2, Wallet, CheckCircle, Clock, CreditCard, ExternalLink, Settings, Save } from 'lucide-react'
import Link from 'next/link'
import styles from './detail.module.css'

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [partner, setPartner] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        const fetchDetails = async () => {
            const res = await getPartnerDetails(id)
            if (res.success) {
                setPartner(res.data)
            }
            setLoading(false)
        }
        fetchDetails()
    }, [id])

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>กำลังโหลด...</div>
    if (!partner) return <div style={{ padding: 40, textAlign: 'center' }}>ไม่พบข้อมูล Partner</div>

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
                    <div style={{ fontSize: 12, opacity: 0.8 }}>ยอดเงินในกระเป๋า</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>฿{partner.walletBalance.toLocaleString()}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    ภาพรวม
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    ประวัติทั้งหมด
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    ตั้งค่า
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
                                <div className={styles.statLabel}>ยอดขายรวม (จำนวน)</div>
                                <div className={styles.statValue}>{partner._count.gameTopups} รายการ</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>ยอดขายรวม (มูลค่า)</div>
                                <div className={styles.statValue}>฿{partner.stats?.totalSalesVolume.toLocaleString()}</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>อัตราสำเร็จ (Success Rate)</div>
                                <div className={styles.statValue} style={{ color: partner.stats?.successRate >= 90 ? '#10b981' : partner.stats?.successRate >= 50 ? '#f59e0b' : '#ef4444' }}>
                                    {partner.stats?.successRate}%
                                </div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>ใช้งานล่าสุด</div>
                                <div className={styles.statValue} style={{ fontSize: 16 }}>
                                    {partner.stats?.lastActive ? new Date(partner.stats.lastActive).toLocaleString('th-TH') : '-'}
                                </div>
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

            {activeTab === 'history' && (
                <div className={styles.card}>
                    <HistorySection partner={partner} />
                </div>
            )}

            {activeTab === 'settings' && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>ตั้งค่าร้านค้า</h3>
                    <div className={styles.formContainer}>
                        <form action={async (formData) => {
                            const name = formData.get('name') as string
                            const domain = formData.get('domain') as string
                            const subscriptionStatus = formData.get('subscriptionStatus') as string

                            // Simple client-side optimization or just use transition
                            if (!name) return alert('กรุณาระบุชื่อร้านค้า')

                            // const { updatePartner } = await import('../actions') // Removed dynamic import
                            const res = await updatePartner(id, { name, domain, subscriptionStatus })

                            if (res.success) {
                                alert('บันทึกข้อมูลเรียบร้อยแล้ว')
                                window.location.reload() // Reload to reflect changes globally
                            } else {
                                alert('เกิดข้อผิดพลาด: ' + res.error)
                            }
                        }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>ชื่อร้านค้า <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    name="name"
                                    defaultValue={partner.name}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>โดเมน (ไม่ต้องใส่ http)</label>
                                <input
                                    name="domain"
                                    defaultValue={partner.domain || ''}
                                    placeholder="example.com"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>สถานะ</label>
                                <select
                                    name="subscriptionStatus"
                                    defaultValue={partner.subscriptionStatus}
                                    className={styles.select}
                                >
                                    <option value="ACTIVE">ACTIVE (ใช้งานปกติ)</option>
                                    <option value="PENDING">PENDING (รออนุมัติ)</option>
                                    <option value="SUSPENDED">SUSPENDED (ระงับการใช้งาน)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                            >
                                <Save size={20} />
                                บันทึกการเปลี่ยนแปลง
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

function HistorySection({ partner }: { partner: any }) {
    const [historyTab, setHistoryTab] = useState('transactions')

    return (
        <div>
            <div className={styles.subTabs}>
                <button
                    className={`${styles.subTab} ${historyTab === 'transactions' ? styles.activeSubTab : ''}`}
                    onClick={() => setHistoryTab('transactions')}
                >
                    ธุรกรรมการเงิน
                </button>
                <button
                    className={`${styles.subTab} ${historyTab === 'audit' ? styles.activeSubTab : ''}`}
                    onClick={() => setHistoryTab('audit')}
                >
                    ประวัติการแก้ไข (Audit Log)
                </button>
                <button
                    className={`${styles.subTab} ${historyTab === 'login' ? styles.activeSubTab : ''}`}
                    onClick={() => setHistoryTab('login')}
                >
                    การเข้าใช้งาน (User Activity)
                </button>
            </div>

            {historyTab === 'transactions' && (
                <div>
                    <h4 style={{ margin: '0 0 16px', fontSize: 14 }}>การเติมเงินเกม (Game Topups)</h4>
                    <Table
                        headers={['วันที่', 'เกม', 'ลูกค้า', 'จำนวนเงิน', 'สถานะ']}
                        data={partner.recentTransactions}
                        renderRow={(item: any) => (
                            <tr key={item.id}>
                                <td>{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                <td>{item.game.name}</td>
                                <td>{item.customer?.userId?.slice(0, 8)}...</td>
                                <td>฿{item.sellPrice.toLocaleString()}</td>
                                <td><StatusBadge status={item.status} /></td>
                            </tr>
                        )}
                        emptyMessage="ไม่มีรายการเติมเงิน"
                    />

                    <div style={{ height: 24 }} />

                    <h4 style={{ margin: '0 0 16px', fontSize: 14 }}>การเติมเงิน wallet (Partner Topups)</h4>
                    <Table
                        headers={['วันที่', 'จำนวนเงิน', 'สถานะ']}
                        data={partner.partnerTopups || []}
                        renderRow={(item: any) => (
                            <tr key={item.id}>
                                <td>{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                <td>฿{item.amount.toLocaleString()}</td>
                                <td><StatusBadge status={item.status} /></td>
                            </tr>
                        )}
                        emptyMessage="ไม่มีรายการเติม wallet"
                    />

                    <div style={{ height: 24 }} />

                    <h4 style={{ margin: '0 0 16px', fontSize: 14 }}>การชำระค่าบริการ (Subscriptions)</h4>
                    <Table
                        headers={['วันที่', 'จำนวนเงิน', 'สถานะ']}
                        data={partner.subscriptionTxns || []}
                        renderRow={(item: any) => (
                            <tr key={item.id}>
                                <td>{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                <td>฿{item.amount.toLocaleString()}</td>
                                <td><StatusBadge status={item.status} /></td>
                            </tr>
                        )}
                        emptyMessage="ไม่มีรายการชำระค่าบริการ"
                    />
                </div>
            )}

            {historyTab === 'audit' && (
                <Table
                    headers={['วันที่', 'ผู้ทำรายการ', 'กิจกรรม', 'รายละเอียด']}
                    data={partner.auditLogs || []}
                    renderRow={(item: any) => (
                        <tr key={item.id}>
                            <td>{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                            <td>{item.userId ? 'Admin' : 'System'}</td>
                            <td>{item.action}</td>
                            <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.details}>
                                {item.details}
                            </td>
                        </tr>
                    )}
                    emptyMessage="ไม่มีประวัติการแก้ไข"
                />
            )}

            {historyTab === 'login' && (
                <Table
                    headers={['วันที่', 'ผู้ใช้งาน', 'IP Address', 'User Agent']}
                    data={partner.userActivities || []}
                    renderRow={(item: any) => (
                        <tr key={item.id}>
                            <td>{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                            <td>{item.user?.username || '-'}</td>
                            <td>{item.ipAddress || '-'}</td>
                            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.userAgent}>
                                {item.userAgent || '-'}
                            </td>
                        </tr>
                    )}
                    emptyMessage="ไม่มีประวัติการเข้าใช้งาน"
                />
            )}
        </div>
    )
}

function Table({ headers, data, renderRow, emptyMessage }: any) {
    if (!data || data.length === 0) {
        return <div style={{ padding: 20, textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: 12 }}>{emptyMessage}</div>
    }
    return (
        <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
                <thead>
                    <tr>{headers.map((h: string) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {data.map((item: any) => renderRow(item))}
                </tbody>
            </table>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const isSuccess = status === 'SUCCESS' || status === 'ACTIVE'
    return (
        <span style={{
            color: isSuccess ? '#166534' : '#b45309',
            background: isSuccess ? '#dcfce7' : '#fef3c7',
            padding: '2px 8px', borderRadius: 4, fontSize: 12
        }}>
            {status}
        </span>
    )
}
