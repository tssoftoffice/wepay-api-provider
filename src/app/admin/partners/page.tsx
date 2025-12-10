'use client'

import { useEffect, useState } from 'react'
import { getPartners } from './actions'
import { Plus, Search, Eye, MoreVertical, Wallet } from 'lucide-react'
import Link from 'next/link'
import styles from './styles.module.css'

export default function PartnersListPage() {
    const [partners, setPartners] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchPartners = async () => {
            setLoading(true)
            setError('')
            const res = await getPartners(searchTerm)
            if (res.success) {
                setPartners(res.data)
            } else {
                setError(res.error || 'Something went wrong')
            }
            setLoading(false)
        }

        // Debounce search
        const timer = setTimeout(() => {
            fetchPartners()
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>จัดการ Partner</h1>
                    <p className={styles.subtitle}>บริหารจัดการร้านค้าและบัญชีพันธมิตรทั้งหมด ({partners.length})</p>
                </div>
                <Link href="/admin/partners/create" className={styles.createButton}>
                    <Plus size={20} />
                    สร้าง Partner ใหม่
                </Link>
            </div>

            {/* Search Bar */}
            <div className={styles.searchBar}>
                <Search size={20} className={styles.searchIcon} />
                <input
                    placeholder="ค้นหาชื่อร้าน, โดเมน, หรือเบอร์โทร..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ชื่อร้านค้า / โดเมน</th>
                            <th>บัญชีผู้ดูแล</th>
                            <th>ยอดเงิน (Wallet)</th>
                            <th>สถานะ</th>
                            <th>ยอดขายรวม</th>
                            <th>วันที่สมัคร</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>{error}</td>
                            </tr>
                        ) : partners.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>ไม่พบข้อมูล Partner</td>
                            </tr>
                        ) : (
                            partners.map((partner) => (
                                <tr key={partner.id}>
                                    <td>
                                        <div className={styles.storeName}>{partner.name}</div>
                                        <div className={styles.domain}>@{partner.domain || '-'}</div>
                                    </td>
                                    <td>
                                        <div className={styles.userEmail}>{partner.users[0]?.email || '-'}</div>
                                        <div className={styles.userPhone}>{partner.users[0]?.phone || '-'}</div>
                                    </td>
                                    <td>
                                        <div className={styles.wallet}>
                                            <Wallet size={14} className={styles.walletIcon} />
                                            ฿{partner.walletBalance.toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${partner.subscriptionStatus === 'ACTIVE' ? styles.badgeSuccess : styles.badgePending}`}>
                                            {partner.subscriptionStatus}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>
                                        {partner._count.gameTopups} รายการ
                                    </td>
                                    <td style={{ color: '#64748b', fontSize: '14px' }}>
                                        {new Date(partner.createdAt).toLocaleDateString('th-TH')}
                                    </td>
                                    <td>
                                        <Link href={`/admin/partners/${partner.id}`} className={styles.actionButton}>
                                            <Eye size={18} />
                                            ดูข้อมูล
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
