'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import styles from './Navbar.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

export function Navbar() {
    const { t, language, setLanguage } = useLanguage()
    const { user, loading, logout } = useAuth()

    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true)
    }

    const confirmLogout = async () => {
        await logout()
        setShowLogoutConfirm(false)
    }

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    {/* ================= LEFT GROUP ================= */}
                    <div className={styles.leftGroup}>
                        {/* Logo */}
                        <Link href="/" className={styles.logo}>
                            <span className={styles.logoIcon}>🎮</span>
                            <span className={styles.logoText}>GamesFlows</span>
                        </Link>

                        {/* Navigation */}
                        <div className={styles.navLinks}>
                            <Link href="/" className={styles.navLink}>
                                {t.navbar.home}
                            </Link>
                            <Link href="#services" className={styles.navLink} scroll={true}>
                                {t.navbar.services}
                            </Link>

                            {/* Contact Dropdown */}
                            <div className={styles.dropdownContainer}>
                                <span className={styles.navLink}>
                                    {t.navbar.contact} ▾
                                </span>

                                <div className={styles.dropdownMenu}>
                                    <a
                                        href="https://facebook.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.dropdownItem}
                                    >
                                        <div
                                            className={styles.itemIcon}
                                            style={{ background: '#1877f2', color: 'white' }}
                                        >
                                            f
                                        </div>
                                        <div className={styles.itemContent}>
                                            <div className={styles.itemTitle}>Facebook</div>
                                        </div>
                                    </a>

                                    <a
                                        href="https://discord.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.dropdownItem}
                                    >
                                        <div
                                            className={styles.itemIcon}
                                            style={{ background: '#5865F2', color: 'white' }}
                                        >
                                            💬
                                        </div>
                                        <div className={styles.itemContent}>
                                            <div className={styles.itemTitle}>Discord</div>
                                        </div>
                                    </a>

                                    <a
                                        href="https://line.me"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.dropdownItem}
                                    >
                                        <div
                                            className={styles.itemIcon}
                                            style={{ background: '#06c755', color: 'white' }}
                                        >
                                            L
                                        </div>
                                        <div className={styles.itemContent}>
                                            <div className={styles.itemTitle}>Line</div>
                                        </div>
                                    </a>

                                    <Link href="/faq" className={styles.dropdownItem}>
                                        <div className={styles.itemContent}>
                                            <div className={styles.itemTitle}>
                                                {t.navbar.faq}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT GROUP ================= */}
                    <div className={styles.rightGroup}>
                        {/* Language Switcher */}
                        <div className={styles.langSwitcher}>
                            <button
                                onClick={() => setLanguage('th')}
                                className={`${styles.langBtn} ${language === 'th' ? styles.activeLang : ''
                                    }`}
                            >
                                TH
                            </button>
                            <span className={styles.divider}>|</span>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`${styles.langBtn} ${language === 'en' ? styles.activeLang : ''
                                    }`}
                            >
                                EN
                            </button>
                        </div>

                        {/* Auth */}
                        <div className={styles.authButtons}>
                            {loading ? (
                                <span>...</span>
                            ) : user ? (
                                <>
                                    <span className={styles.welcome}>
                                        Hi, {user.username}
                                    </span>

                                    {user.role === 'PARTNER_OWNER' && (
                                        <Link href="/partner/dashboard">
                                            <Button className={styles.agentBtn}>
                                                {t.sidebar.dashboard}
                                            </Button>
                                        </Link>
                                    )}

                                    <Button
                                        onClick={handleLogoutClick}
                                        variant="secondary"
                                        className={styles.loginBtn}
                                    >
                                        {t.navbar.logout}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/register/agent">
                                        <Button className={styles.agentBtn}>
                                            {t.navbar.registerAgent}
                                        </Button>
                                    </Link>
                                    <Link href="/login">
                                        <Button className={styles.loginBtn}>
                                            {t.navbar.login}
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ================= LOGOUT MODAL ================= */}
            <Modal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                title={t.navbar.logoutConfirmTitle}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setShowLogoutConfirm(false)}
                        >
                            {t.navbar.cancel}
                        </Button>
                        <Button
                            onClick={confirmLogout}
                            style={{
                                background: '#ef4444',
                                borderColor: '#ef4444',
                                color: 'white',
                            }}
                        >
                            {t.navbar.logout}
                        </Button>
                    </>
                }
            >
                <p>{t.navbar.logoutConfirmMessage}</p>
            </Modal>
        </>
    )
}
