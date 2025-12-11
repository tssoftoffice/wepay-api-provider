'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, DollarSign, TrendingUp, CheckCircle, AlertTriangle, Calendar, Plus, QrCode, FileDown, Printer, ChevronRight, Package, CreditCard } from 'lucide-react'

interface Stats {
    totalPartners: number
    totalRevenue: number
    netProfit: number
    todayProfit: number
    totalTxnCount: number
    todayTxnCount: number
    chartData: { date: string; revenue: number; profit: number }[]
    topPartners: { name: string; revenue: number; cost: number; profit: number; adminRevenue: number; adminCost: number; adminProfit: number; txnCount: number }[]
    salesDistribution: { name: string; revenue: number; percentage: number }[]
    subscriptionRevenue: number
    subscriptionCount: number
    todaySubscriptionRevenue: number
    newPartnersToday: number
    totalPartnerTopup: number
    totalPartnerTopupCount: number
}

export default function AdminDashboardClient() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        )
    }

    if (!stats) {
        return <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280' }}>ไม่สามารถโหลดข้อมูลได้</div>
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Row 1: 3 Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <StatCard
                    label="กำไรสุทธิ"
                    value={`฿${(stats.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext={(stats.totalRevenue || 0) > 0 ? `Margin ${((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)}%` : 'N/A'}
                    icon={<TrendingUp size={24} />}
                    iconBg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    trend="up"
                />
                <StatCard
                    label="กำไรวันนี้"
                    value={`฿${(stats.todayProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext={`${stats.todayTxnCount || 0} ธุรกรรมวันนี้`}
                    icon={<Calendar size={24} />}
                    iconBg="linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
                    trend="up"
                />
                <StatCard
                    label="Partners ทั้งหมด"
                    value={(stats.totalPartners || 0).toLocaleString()}
                    subtext={`Active Partners`}
                    icon={<Users size={24} />}
                    iconBg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                    trend="up"
                />
            </div>

            {/* Row 2: Remaining 5 Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                <StatCard
                    label="Partner ใหม่วันนี้"
                    value={`+${(stats.newPartnersToday || 0)}`}
                    subtext="ร้านค้า"
                    icon={<Users size={24} />}
                    iconBg="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" // Violet
                    trend="up"
                />
                <StatCard
                    label="Subscription วันนี้"
                    value={`฿${(stats.todaySubscriptionRevenue || 0).toLocaleString()}`}
                    subtext="รายได้ค่าสมาชิก"
                    icon={<DollarSign size={24} />}
                    iconBg="linear-gradient(135deg, #a855f7 0%, #9333ea 100%)" // Purple
                    trend="up"
                />
                <StatCard
                    label="ยอดการเติมเกมทั้งหมด"
                    value={`฿${(stats.totalRevenue || 0).toLocaleString()}`}
                    subtext={`${stats.totalTxnCount || 0} ธุรกรรมสำเร็จ`}
                    icon={<CheckCircle size={24} />}
                    iconBg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    trend="up"
                />
                <StatCard
                    label="รายได้ Subscription (รวม)"
                    value={`฿${(stats.subscriptionRevenue || 0).toLocaleString()}`}
                    subtext={`${stats.subscriptionCount || 0} รายการ`}
                    icon={<DollarSign size={24} />}
                    iconBg="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
                    trend="up"
                />
                <StatCard
                    label="Partner เติมเครดิต"
                    value={`฿${(stats.totalPartnerTopup || 0).toLocaleString()}`}
                    subtext={`${stats.totalPartnerTopupCount || 0} รายการ`}
                    icon={<CreditCard size={24} />}
                    iconBg="linear-gradient(135deg, #ec4899 0%, #be185d 100%)" // Pink/Rose theme
                    trend="up"
                />
            </div>

            {/* Row 2: Charts */}
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Bar Chart */}
                <div style={{
                    flex: 2,
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>สถิติการขาย</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>ข้อมูลย้อนหลัง 7 วัน</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6' }}></span> รายได้
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#93c5fd' }}></span> กำไร
                            </span>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
                        {(stats.chartData || []).length > 0 ? (
                            stats.chartData.slice(-7).map((d, i) => {
                                const max = Math.max(...stats.chartData.slice(-7).map(x => x.revenue), 1)
                                const revenueH = Math.max((d.revenue / max) * 100, 8)
                                const profitH = Math.max((d.profit / max) * 100, 4)
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '220px', width: '100%' }}>
                                            <div style={{
                                                flex: 1,
                                                height: `${revenueH}%`,
                                                background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)',
                                                borderRadius: '6px 6px 0 0',
                                                minHeight: '12px',
                                                position: 'relative'
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '-18px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    color: '#2563eb',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {d.revenue > 0 ? d.revenue.toLocaleString() : ''}
                                                </span>
                                            </div>
                                            <div style={{
                                                flex: 1,
                                                height: `${profitH}%`,
                                                background: 'linear-gradient(180deg, #93c5fd 0%, #bfdbfe 100%)',
                                                borderRadius: '6px 6px 0 0',
                                                minHeight: '8px',
                                                position: 'relative'
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '-18px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    color: '#60a5fa',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {d.profit > 0 ? d.profit.toLocaleString() : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
                                            {new Date(d.date).getDate()} {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][new Date(d.date).getMonth()]}
                                        </span>
                                    </div>
                                )
                            })
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                    <p>ยังไม่มีข้อมูลรายได้</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Donut Chart - Dynamic */}
                <div style={{
                    flex: 1,
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>สัดส่วนยอดขาย</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>แยกตามเกม</p>

                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <circle cx="50" cy="50" r="35" fill="none" stroke="#f3f4f6" strokeWidth="16" />
                                {stats.salesDistribution && stats.salesDistribution.length > 0 && (() => {
                                    const colors = ['#fbbf24', '#3b82f6', '#ec4899', '#10b981', '#8b5cf6']
                                    const circumference = 2 * Math.PI * 35
                                    let offset = 0
                                    return stats.salesDistribution.map((item, idx) => {
                                        const dashLength = (item.percentage / 100) * circumference
                                        const dashGap = circumference - dashLength
                                        const currentOffset = offset
                                        offset += dashLength
                                        return (
                                            <circle key={idx} cx="50" cy="50" r="35" fill="none"
                                                stroke={colors[idx % colors.length]} strokeWidth="16"
                                                strokeDasharray={`${dashLength} ${dashGap}`}
                                                strokeDashoffset={-currentOffset} strokeLinecap="round" />
                                        )
                                    })
                                })()}
                            </svg>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.salesDistribution && stats.salesDistribution.length > 0 ? (
                            stats.salesDistribution.map((item, idx) => {
                                const colors = ['#fbbf24', '#3b82f6', '#ec4899', '#10b981', '#8b5cf6']
                                return <LegendRow key={idx} color={colors[idx % colors.length]} label={item.name} value={`${item.percentage}%`} />
                            })
                        ) : (
                            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>ยังไม่มีข้อมูล</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 3: Quick Actions & Table */}
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Quick Actions */}
                <div style={{
                    width: '320px',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    flexShrink: 0
                }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 600, color: '#111827' }}>การดำเนินการด่วน</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <ActionCard icon={<Plus size={20} />} iconBg="#3b82f6" title="สร้าง Partner ใหม่" subtitle="เพิ่มร้านค้าพันธมิตร" href="/admin/partners/create" />
                        <ActionCard icon={<QrCode size={20} />} iconBg="#10b981" title="สแกน QR" subtitle="ตรวจสอบธุรกรรม" />
                        <ActionCard icon={<FileDown size={20} />} iconBg="#8b5cf6" title="Import ข้อมูล" subtitle="นำเข้าจากไฟล์ Excel" />
                        <ActionCard icon={<Printer size={20} />} iconBg="#f59e0b" title="พิมพ์รายงาน" subtitle="สรุปยอดขายประจำเดือน" />
                    </div>
                </div>

                {/* Recent Partners Table */}
                <div style={{
                    flex: 1,
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Partner ล่าสุด</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>รายการล่าสุด 5 รายการ</p>
                        </div>
                        <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ดูทั้งหมด <ChevronRight size={16} />
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>ร้านค้า</th>
                                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>ธุรกรรม</th>
                                <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>ต้นทุนระบบ (WePay)</th>
                                <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>ราคาขายให้ Partner</th>
                                <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>กำไรระบบ (Admin)</th>
                                <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>ราคาที่ Partner ขาย</th>
                                <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>กำไร Partner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats.topPartners || []).length > 0 ? (
                                stats.topPartners.slice(0, 5).map((p, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: '#dbeafe',
                                                    color: '#3b82f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 600
                                                }}>
                                                    {p.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{p.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 14px', textAlign: 'right', color: '#6b7280' }}>
                                            {p.txnCount.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 14px', textAlign: 'right', color: '#64748b', fontSize: '13px' }}>
                                            ฿{(p.adminCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                        </td>
                                        <td style={{ padding: '14px 14px', textAlign: 'right', fontWeight: 500, color: '#374151', fontSize: '13px' }}>
                                            ฿{(p.adminRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                        </td>
                                        <td style={{ padding: '14px 14px', textAlign: 'right', fontWeight: 600, color: '#10b981', fontSize: '13px' }}>
                                            ฿{(p.adminProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                        </td>
                                        <td style={{ padding: '14px 14px', textAlign: 'right', fontWeight: 500, color: '#374151', fontSize: '13px' }}>
                                            ฿{(p.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                        </td>
                                        <td style={{ padding: '14px 14px', textAlign: 'right', fontWeight: 600, color: '#059669', fontSize: '13px' }}>
                                            ฿{(p.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                                        <Package size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                        <p style={{ margin: 0 }}>ยังไม่มีข้อมูล Partner</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, subtext, icon, iconBg, trend }: {
    label: string; value: string; subtext: string; icon: React.ReactNode; iconBg: string; trend: string
}) {
    return (
        <div style={{
            flex: 1,
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{label}</p>
                    <p style={{ margin: '8px 0 0', fontSize: '32px', fontWeight: 700, color: '#111827' }}>{value}</p>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: trend === 'up' ? '#10b981' : '#6b7280' }}>
                        {trend === 'up' && '↑ '}{subtext}
                    </p>
                </div>
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#374151' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: color }}></span>
                {label}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{value}</span>
        </div>
    )
}

function ActionCard({ icon, iconBg, title, subtitle, href }: { icon: React.ReactNode; iconBg: string; title: string; subtitle: string; href?: string }) {
    const Content = (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: 'white' // Ensure background is set
        }}>
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>{title}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>{subtitle}</p>
            </div>
            <ChevronRight size={18} color="#9ca3af" />
        </div>
    )

    if (href) {
        return <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{Content}</Link>
    }

    return Content
}
