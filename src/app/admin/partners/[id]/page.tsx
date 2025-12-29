'use client'

import { useEffect, useState, use } from 'react'
import { getPartnerDetails, updatePartner, resetPartnerUserPassword, adjustPartnerBalance } from '../actions'
import { ArrowLeft, User, Building2, Wallet, CheckCircle, Clock, CreditCard, ExternalLink, Settings, Save, Key, Lock, Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

// ... (Rest of imports)

// ... (Existing Components)

function UserManagement({ users }: { users: any[] }) {
    const [editingUser, setEditingUser] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleReset = async (userId: string) => {
        if (!newPassword || newPassword.length < 6) {
            alert('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
            return
        }

        if (!confirm('คุณต้องการเปลี่ยนรหัสผ่านสำหรับผู้ใช้นี้ใช่หรือไม่?')) return

        setLoading(true)
        const res = await resetPartnerUserPassword(userId, newPassword)
        setLoading(false)

        if (res.success) {
            alert('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')
            setEditingUser(null)
            setNewPassword('')
        } else {
            alert('เกิดข้อผิดพลาด: ' + res.error)
        }
    }

    return (
        <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={20} />
                จัดการผู้ใช้งาน (User Management)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {users.map((u) => (
                    <div key={u.id} style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: 16,
                        background: '#f8fafc'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#334155' }}>{u.username}</div>
                                    <div style={{ fontSize: 13, color: '#64748b' }}>{u.email || '-'}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>ID: {u.id}</div>
                                </div>
                            </div>

                            {editingUser === u.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            placeholder="รหัสผ่านใหม่"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{
                                                padding: '8px 12px 8px 36px',
                                                borderRadius: 8,
                                                border: '1px solid #cbd5e1',
                                                fontSize: 14,
                                                outline: 'none',
                                                width: 180
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleReset(u.id)}
                                        disabled={loading}
                                        style={{
                                            background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                            opacity: loading ? 0.7 : 1
                                        }}
                                    >
                                        {loading ? '...' : 'บันทึก'}
                                    </button>
                                    <button
                                        onClick={() => { setEditingUser(null); setNewPassword('') }}
                                        style={{ background: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditingUser(u.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        background: 'white', color: '#3b82f6', border: '1px solid #3b82f6',
                                        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                        transition: 'all 0.2s hover'
                                    }}
                                >
                                    <Key size={16} />
                                    เปลี่ยนรหัสผ่าน
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps, Legend } from 'recharts'
import Link from 'next/link'
import styles from './detail.module.css'

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [partner, setPartner] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState('overview')
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
    const [adjustAmount, setAdjustAmount] = useState('')
    const [adjustNote, setAdjustNote] = useState('')
    const [adjustLoading, setAdjustLoading] = useState(false)

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
                        {partner.subscriptionEnd && (
                            <>
                                <span>•</span>
                                <span style={{ color: new Date(partner.subscriptionEnd) < new Date() ? '#ef4444' : '#10b981' }}>
                                    หมดอายุ: {new Date(partner.subscriptionEnd).toLocaleDateString('th-TH')}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.walletCard}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>ยอดเงินในกระเป๋า</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>฿{partner.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                    <button
                        onClick={() => setIsAdjustModalOpen(true)}
                        style={{
                            marginTop: 8,
                            width: '100%',
                            padding: '6px',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                        }}
                    >
                        <Pencil size={12} /> ปรับยอดเงิน
                    </button>
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
                    {/* Top Row: Key Metrics */}
                    <div className={styles.metricsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>ยอดขายรวม (จำนวน)</div>
                            <div className={styles.statValue}>{partner._count.gameTopups} รายการ</div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>Total Transactions</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>ยอดขายรวม (มูลค่า)</div>
                            <div className={styles.statValue}>฿{partner.stats?.totalSalesVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>Gross Sales</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>กำไร Partner (ได้รับ)</div>
                            <div className={styles.statValue} style={{ color: '#10b981' }}>
                                ฿{partner.stats?.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>Net Profit</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>อัตราสำเร็จ</div>
                            <div className={styles.statValue} style={{ color: partner.stats?.successRate >= 90 ? '#10b981' : partner.stats?.successRate >= 50 ? '#f59e0b' : '#ef4444' }}>
                                {partner.stats?.successRate}%
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>Success Rate</div>
                        </div>
                    </div>

                    {/* Main Content: Chart + Info */}
                    <div className={styles.contentGrid}>
                        {/* Left: Chart */}
                        <div className={styles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h3 className={styles.cardTitle}>สถิติยอดขายและกำไร (รายวัน)</h3>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
                                        <span style={{ width: 12, height: 12, borderRadius: 3, background: '#3b82f6' }}></span> ยอดขาย
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
                                        <span style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }}></span> กำไร
                                    </span>
                                </div>
                            </div>

                            <div style={{ height: 350, marginTop: 20 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={partner.chartData?.map((d: any) => ({
                                            ...d,
                                            cost: d.sales - d.profit
                                        })) || []}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            stroke="#94a3b8"
                                            dy={10}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            stroke="#94a3b8"
                                            tickFormatter={(value) => `฿${value.toLocaleString()}`}
                                        />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar
                                            dataKey="cost"
                                            stackId="a"
                                            fill="#e2e8f0"
                                            name="ต้นทุน (WePay)"
                                            barSize={20}
                                        />
                                        <Bar
                                            dataKey="profit"
                                            stackId="a"
                                            fill="#8b5cf6"
                                            name="กำไร (Partner)"
                                            barSize={20}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Right: Info & Contact */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Admin Info */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>ผู้ดูแลระบบ</h3>
                                {partner.users.map((u: any) => (
                                    <div key={u.id} className={styles.userItem}>
                                        <div className={styles.userAvatar}>
                                            <User size={18} />
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.username}</div>
                                            <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Additional Info */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>ข้อมูลการใช้งาน</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>ใช้งานล่าสุด</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#334155' }}>
                                            <Clock size={16} />
                                            {partner.stats?.lastActive ? new Date(partner.stats.lastActive).toLocaleString('th-TH') : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>โดเมนร้านค้า</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#334155' }}>
                                            <ExternalLink size={16} />
                                            {partner.domain ? <a href={`https://${partner.domain}`} target="_blank" style={{ color: '#3b82f6', textDecoration: 'none' }}>{partner.domain}</a> : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {
                activeTab === 'history' && (
                    <div className={styles.card}>
                        <HistorySection partner={partner} />
                    </div>
                )
            }

            {
                activeTab === 'settings' && (
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>ตั้งค่าร้านค้า</h3>
                        <div className={styles.formContainer}>
                            <form action={async (formData) => {
                                const name = formData.get('name') as string
                                const domain = formData.get('domain') as string
                                const subscriptionStatus = formData.get('subscriptionStatus') as string

                                if (!name) return alert('กรุณาระบุชื่อร้านค้า')

                                const subscriptionEnd = formData.get('subscriptionEnd') as string

                                if (!name) return alert('กรุณาระบุชื่อร้านค้า')

                                const res = await updatePartner(id, { name, domain, subscriptionStatus, subscriptionEnd })

                                if (res.success) {
                                    alert('บันทึกข้อมูลเรียบร้อยแล้ว')
                                    window.location.reload()
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

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>วันหมดอายุสมาชิก (Subscription End)</label>
                                    <input
                                        type="date"
                                        name="subscriptionEnd"
                                        defaultValue={partner.subscriptionEnd ? new Date(partner.subscriptionEnd).toISOString().split('T')[0] : ''}
                                        className={styles.input}
                                    />
                                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                        * หากไม่ระบุ จะถือว่าไม่มีวันหมดอายุ
                                    </div>
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

                        <div style={{ marginTop: 40, borderTop: '1px solid #e2e8f0', paddingTop: 30 }}>
                            <UserManagement users={partner.users} />
                        </div>
                    </div>
                )
            }



            <Modal
                isOpen={isAdjustModalOpen}
                onClose={() => setIsAdjustModalOpen(false)}
                title="ปรับยอดเงินในกระเป๋า (Adjust Wallet Balance)"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)}>ยกเลิก</Button>
                        <Button
                            onClick={async () => {
                                if (!adjustAmount || Number(adjustAmount) === 0) return alert('กรุณาระบุจำนวนเงิน')
                                if (!adjustNote) return alert('กรุณาระบุหมายเหตุ')

                                setAdjustLoading(true)
                                const res = await adjustPartnerBalance(id, Number(adjustAmount), adjustNote)
                                setAdjustLoading(false)

                                if (res.success) {
                                    alert('ปรับยอดเงินเรียบร้อยแล้ว')
                                    setIsAdjustModalOpen(false)
                                    setAdjustAmount('')
                                    setAdjustNote('')
                                    window.location.reload()
                                } else {
                                    alert('เกิดข้อผิดพลาด: ' + res.error)
                                }
                            }}
                            disabled={adjustLoading}
                        >
                            {adjustLoading ? 'กำลังบันทึก...' : 'ยืนยัน'}
                        </Button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>จำนวนเงิน (บาท)</label>
                        <input
                            type="number"
                            value={adjustAmount}
                            onChange={e => setAdjustAmount(e.target.value)}
                            placeholder="เช่น 100 หรือ -50"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: 14
                            }}
                        />
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                            * ใส่จำนวนบวกเพื่อเพิ่มเงิน, จำนวนลบเพื่อหักเงิน
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>หมายเหตุ (Reason)</label>
                        <input
                            type="text"
                            value={adjustNote}
                            onChange={e => setAdjustNote(e.target.value)}
                            placeholder="ระบุสาเหตุการปรับยอด"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: 14
                            }}
                        />
                    </div>
                </div>
            </Modal>
        </div >
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ margin: 0, fontSize: 14 }}>การเติมเงินเกม (Game Topups)</h4>
                        <Link href={`/admin/financials/transactions?partnerId=${partner.id}&type=GAME_SALE`} style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}>
                            ดูทั้งหมด &gt;
                        </Link>
                    </div>
                    <Table
                        headers={['วันที่', 'เกม', 'ลูกค้า', 'จำนวนเงิน', 'สถานะ']}
                        data={partner.recentTransactions}
                        renderRow={(item: any) => (
                            <tr key={item.id}>
                                <td>{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                <td>{item.game.name}</td>
                                <td>{item.customer?.userId?.slice(0, 8)}...</td>
                                <td>฿{item.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                <td><StatusBadge status={item.status} /></td>
                            </tr>
                        )}
                        emptyMessage="ไม่มีรายการเติมเงิน"
                    />

                    <div style={{ height: 24 }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ margin: 0, fontSize: 14 }}>การเติมเงิน wallet (Partner Topups)</h4>
                        <Link href={`/admin/financials/transactions?partnerId=${partner.id}&type=TOPUP`} style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}>
                            ดูทั้งหมด &gt;
                        </Link>
                    </div>
                    <Table
                        headers={['วันที่', 'จำนวนเงิน', 'สถานะ']}
                        data={partner.partnerTopups || []}
                        renderRow={(item: any) => (
                            <tr key={item.id}>
                                <td>{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                <td>฿{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                <td><StatusBadge status={item.status} /></td>
                            </tr>
                        )}
                        emptyMessage="ไม่มีรายการเติม wallet"
                    />

                    <div style={{ height: 24 }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ margin: 0, fontSize: 14 }}>การชำระค่าบริการ (Subscriptions)</h4>
                        <Link href={`/admin/financials/transactions?partnerId=${partner.id}&type=SUBSCRIPTION`} style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}>
                            ดูทั้งหมด &gt;
                        </Link>
                    </div>
                    <Table
                        headers={['วันที่', 'จำนวนเงิน', 'สถานะ']}
                        data={partner.subscriptionTxns || []}
                        renderRow={(item: any) => (
                            <tr key={item.id}>
                                <td>{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                <td>฿{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
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

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        // Calculate Total Sales (Cost + Profit)
        const cost = payload.find((p: any) => p.dataKey === 'cost')?.value || 0
        const profit = payload.find((p: any) => p.dataKey === 'profit')?.value || 0
        const totalSales = cost + profit

        return (
            <div style={{
                background: 'white',
                padding: '12px 16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: '12px',
                minWidth: '180px'
            }}>
                <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                    {new Date(label).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>

                {/* Total Sales */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>ยอดขายรวม</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        ฿{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Breakdown */}
                {payload.slice().reverse().map((p: any) => (
                    <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '12px', color: p.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                            {p.name}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                            ฿{p.value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}
