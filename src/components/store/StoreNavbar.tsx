'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './StoreNavbar.module.css'

interface StoreNavbarProps {
    partner: {
        name: string
        logoUrl?: string | null
        domain: string
    }
    customer?: {
        walletBalance: number
        username: string
    } | null
}

export function StoreNavbar({ partner, customer }: StoreNavbarProps) {
    const { t, language, setLanguage } = useLanguage()
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    {/* Brand */}
                    <Link href={`/store/${partner.domain}`} className={styles.brand}>
                        {partner.logoUrl ? (
                            <img src={partner.logoUrl} alt={partner.name} className={styles.logo} />
                        ) : (
                            <div className={styles.logoPlaceholder}>{partner.name.charAt(0)}</div>
                        )}
                        <span>{partner.name}</span>
                    </Link>

                    {/* Navigation */}
                    <div className={styles.navLinks}>
                        <Link
                            href={`/store/${partner.domain}`}
                            className={`${styles.navLink} ${isActive(`/store/${partner.domain}`) ? styles.activeLink : ''}`}
                        >
                            {t.navbar.home}
                        </Link>
                        <Link
                            href={`/store/${partner.domain}/cashcard`}
                            className={`${styles.navLink} ${isActive(`/store/${partner.domain}/cashcard`) ? styles.activeLink : ''}`}
                        >
                            {t.navbar.cashCard}
                        </Link>
                        <Link
                            href={`/store/${partner.domain}/mobile`}
                            className={`${styles.navLink} ${isActive(`/store/${partner.domain}/mobile`) ? styles.activeLink : ''}`}
                        >
                            {t.navbar.mobileTopup}
                        </Link>
                        <Link
                            href={`/store/${partner.domain}/customer/topup`}
                            className={`${styles.navLink} ${isActive(`/store/${partner.domain}/customer/topup`) ? styles.activeLink : ''}`}
                        >
                            {t.navbar.topup}
                        </Link>
                        <Link
                            href={`/store/${partner.domain}/contact`}
                            className={`${styles.navLink} ${isActive(`/store/${partner.domain}/contact`) ? styles.activeLink : ''}`}
                        >
                            {t.navbar.contact}
                        </Link>
                    </div>
                </div>

                <div className={styles.rightSection}>
                    {/* Language Switcher */}
                    <div className={styles.langSwitcher}>
                        <button
                            onClick={() => setLanguage('th')}
                            className={`${styles.langBtn} ${language === 'th' ? styles.activeLang : ''}`}
                        >
                            TH
                        </button>
                        <span className={styles.divider}>|</span>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`${styles.langBtn} ${language === 'en' ? styles.activeLang : ''}`}
                        >
                            EN
                        </button>
                    </div>

                    {/* Auth Buttons or User Info */}
                    {customer ? (
                        <div className={styles.authButtons}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '1rem' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{customer.username}</span>
                                <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '500' }}>
                                    ฿{Number(customer.walletBalance).toLocaleString()}
                                </span>
                            </div>
                            <Link href={`/store/${partner.domain}/customer/history`}>
                                <button className={styles.loginBtn} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                    History
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <Link href={`/store/${partner.domain}/customer/login`}>
                                <button className={styles.loginBtn}>{t.navbar.login}</button>
                            </Link>
                            <Link href={`/store/${partner.domain}/customer/register`}>
                                <button className={styles.registerBtn}>{t.navbar.registerMember}</button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
