'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user, loading } = useAuth()

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <img src="/logo.jpg" alt="GamesFlows" className={styles.logoImg} />
                    <span className={styles.logoText}>GamesFlows</span>
                </Link>

                {/* Desktop Menu */}
                <div className={styles.desktopMenu}>
                    <Link href="/" className={styles.navLink}>หน้าหลัก</Link>
                    <Link href="#" className={styles.navLink}>บริการของเรา</Link>
                    <Link href="#" className={styles.navLink}>ติดต่อเรา</Link>

                    <div className={styles.authButtons}>
                        {loading ? (
                            <span style={{ color: '#888' }}>...</span>
                        ) : user ? (
                            <Link href="/partner/dashboard" className={styles.btnPrimary}>ไปที่ Dashboard</Link>
                        ) : (
                            <>
                                <Link href="/login" className={styles.btnGhost}>เข้าสู่ระบบ</Link>
                                <Link href="/register/agent" className={styles.btnPrimary}>สมัครตัวแทน</Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={styles.mobileMenuBtn}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
                <div className={styles.mobileMenuContent}>
                    <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>หน้าหลัก</Link>
                    <Link href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>บริการของเรา</Link>
                    <Link href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>ติดต่อเรา</Link>

                    <div className={styles.mobileAuthButtons}>
                        {loading ? (
                            <span style={{ color: '#888' }}>...</span>
                        ) : user ? (
                            <Link href="/partner/dashboard" className={styles.btnMobilePrimary} onClick={() => setIsMobileMenuOpen(false)}>ไปที่ Dashboard</Link>
                        ) : (
                            <>
                                <Link href="/login" className={styles.btnMobileGhost} onClick={() => setIsMobileMenuOpen(false)}>เข้าสู่ระบบ</Link>
                                <Link href="/register/agent" className={styles.btnMobilePrimary} onClick={() => setIsMobileMenuOpen(false)}>สมัครตัวแทน</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
