'use client'

import React from 'react'
import styles from './Footer.module.css'
import Link from 'next/link'

export function Footer() {


    return (
        <footer className={styles.agentFooter}>
            <div className={styles.footerGrid}>
                <div className={styles.footerColumn}>
                    <Link href="/" className={styles.footerLogo}>
                        <img src="/logo.jpg" alt="GamesFlows" className={styles.footerLogoImg} />
                        <span className={styles.footerLogoText}>GamesFlows</span>
                    </Link>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                        เราคือแพลตฟอร์มเติมเกมชั้นนำที่มุ่งมั่นให้บริการที่ดีที่สุด
                        <br />จดทะเบียนถูกต้อง ปลอดภัย 100%
                    </p>
                </div>
                <div className={styles.footerColumn}>
                    <h4>บริการ</h4>
                    <div className={styles.footerLinks}>
                        <Link href="/">หน้าหลัก</Link>
                    </div>
                </div>
                <div className={styles.footerColumn}>
                    <h4>ติดต่อเรา</h4>
                    <p className={styles.contactDesc}>
                        ช่องทางติดต่อสำหรับผู้เล่น & พาร์ทเนอร์ สามารถส่งหลักฐานการโอน แจ้งปัญหาการใช้งาน หรือติดต่อโฆษณาได้ที่นี่
                    </p>
                    <div className={styles.socialIcons}>
                        <a href="#" className={styles.socialIcon} aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                        </a>
                        <a href="#" className={styles.socialIcon} aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                        </a>
                        <a href="#" className={styles.socialIcon} aria-label="TikTok">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                        </a>
                        <a href="#" className={styles.socialIcon} aria-label="YouTube">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>
                        </a>
                        <a href="#" className={styles.socialIcon} aria-label="Discord">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><path d="M9 8c2.67 0 5 2.33 5 5 0 2.67-2.33 5-5 5-1.33 0-2.5-.58-3.33-1.5L4 18l1.5-1.67C4.58 15.5 4 14.33 4 13c0-2.67 2.33-5 5-5z" /><path d="M15 8c2.67 0 5 2.33 5 5 0 2.67-2.33 5-5 5-1.33 0-2.5-.58-3.33-1.5L10 18l1.5-1.67C10.58 15.5 10 14.33 10 13c0-2.67 2.33-5 5-5z" /></svg>
                        </a>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div>© 2026 GamesFlows. สงวนลิขสิทธิ์.</div>
            </div>
        </footer>
    )
}
