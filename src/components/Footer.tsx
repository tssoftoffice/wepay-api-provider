'use client'

import React from 'react'
import styles from './Footer.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

export function Footer() {
    const { t } = useLanguage()

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLogo}>
                    <span className={styles.logoIcon}>🎮</span> EVO PLAYSHOP
                </div>
                <p>© 2024 EvoPlayShop. {t.footer.rights}</p>
                <div className={styles.socials}>
                    <span>Facebook</span>
                    <span>Line</span>
                </div>
            </div>
        </footer>
    )
}
