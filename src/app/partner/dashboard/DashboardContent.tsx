'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import styles from './page.module.css'


interface DashboardContentProps {
    partner: any
}

export function DashboardContent({ partner }: DashboardContentProps) {


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>แดชบอร์ด</h1>
                    <p className={styles.subtitle}>ยินดีต้อนรับกลับ, {partner.storeName || 'Partner'}</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href={`/store/${partner.domain}`} target="_blank">
                        <Button variant="secondary">ดูหน้าร้านค้า</Button>
                    </Link>
                </div>
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>ยอดเงินคงเหลือ</span>
                        <div className={styles.statIcon}>฿</div>
                    </div>
                    <div className={styles.statValue}>฿{Number(partner.walletBalance).toLocaleString()}</div>
                    <Link href="/partner/topup" className={styles.statLink}>เติมเครดิต →</Link>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>สถานะสมาชิก</span>
                        <div className={`${styles.statusDot} ${styles[partner.subscriptionStatus.toLowerCase()]}`}></div>
                    </div>
                    <div className={styles.statValue}>{partner.subscriptionStatus}</div>
                    {partner.subscriptionStatus !== 'ACTIVE' && (
                        <Link href="/partner/subscription" className={styles.statLink}>ต่ออายุทันที →</Link>
                    )}
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>ยอดขายรวม</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.statIconSvg}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    </div>
                    <div className={styles.statValue}>฿0</div>
                    <span className={styles.statSub}>รายได้วันนี้</span>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>เกมที่เปิดขาย</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.statIconSvg}><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>
                    </div>
                    <div className={styles.statValue}>0</div>
                    <Link href="/partner/pricing" className={styles.statLink}>จัดการเกม →</Link>
                </Card>
            </div>

            {/* Recent Activity Section (Placeholder) */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>กิจกรรมล่าสุด</h2>
                <Card className={styles.tableCard}>
                    <div className={styles.emptyState}>
                        <p>ไม่พบรายการล่าสุด</p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
