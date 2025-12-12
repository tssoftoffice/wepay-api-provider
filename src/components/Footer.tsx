'use client'

import React from 'react'
import styles from './Footer.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

export function Footer() {
    const { t } = useLanguage()

    return (
        <footer className={styles.agentFooter}>
            <div className={styles.footerGrid}>
                <div className={styles.footerColumn}>
                    <div className={styles.footerLogo}>
                        <span>GamesFlows</span>
                    </div>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                        เราคือแพลตฟอร์มเติมเกมชั้นนำที่มุ่งมั่นให้บริการที่ดีที่สุด
                        <br />จดทะเบียนถูกต้อง ปลอดภัย 100%
                    </p>
                </div>
                <div className={styles.footerColumn}>
                    <h4>บริการ</h4>
                    <div className={styles.footerLinks}>
                        <Link href="/">หน้าหลัก</Link>

                        <Link href="/contact">ติดต่อเรา</Link>
                    </div>
                </div>
                <div className={styles.footerColumn}>
                    <h4>ช่วยเหลือ</h4>
                    <div className={styles.footerLinks}>
                        <Link href="/faq">คำถามที่พบบ่อย</Link>
                        <Link href="/terms">เงื่อนไขการใช้งาน</Link>
                        <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div>© 2024 GamesFlows. สงวนลิขสิทธิ์.</div>
                <div className={styles.paymentIcons}>
                    <span>Visa</span>
                    <span>Mastercard</span>
                    <span>PayPal</span>
                </div>
            </div>
        </footer>
    )
}
