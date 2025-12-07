'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './StoreFooter.module.css'

interface StoreFooterProps {
    partner: {
        name: string
        domain: string
    }
}

export function StoreFooter({ partner }: StoreFooterProps) {
    const { t } = useLanguage()
    const currentYear = new Date().getFullYear()

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.brandSection}>
                        <h3>{partner.name}</h3>
                        <p className={styles.description}>
                            {t.templates.welcomeMessage.replace('{storeName}', partner.name)}
                        </p>
                    </div>

                    <div className={styles.linksSection}>
                        <div className={styles.linkGroup}>
                            <h4>{t.navbar.services}</h4>
                            <div className={styles.links}>
                                <Link href={`/store/${partner.domain}/games`} className={styles.link}>
                                    {t.navbar.gameTopup}
                                </Link>
                                <Link href={`/store/${partner.domain}/customer/topup`} className={styles.link}>
                                    {t.navbar.topup}
                                </Link>
                            </div>
                        </div>

                        <div className={styles.linkGroup}>
                            <h4>{t.navbar.contact}</h4>
                            <div className={styles.links}>
                                <Link href={`/store/${partner.domain}/contact`} className={styles.link}>
                                    {t.navbar.contact}
                                </Link>
                                <Link href={`/store/${partner.domain}/faq`} className={styles.link}>
                                    {t.navbar.faq}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <div>
                        &copy; {currentYear} {partner.name}. All rights reserved.
                    </div>
                    <div className={styles.poweredBy}>
                        Powered by <Link href="/">EvoPlayShop</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
