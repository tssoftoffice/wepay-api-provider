'use client'

import React from 'react'
import Link from 'next/link'

import styles from './StoreFooter.module.css'

interface StoreFooterProps {
    partner: {
        name: string
        domain: string
    }
}

export function StoreFooter({ partner }: StoreFooterProps) {

    const currentYear = new Date().getFullYear()

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.brandSection}>
                        <h3>{partner.name}</h3>
                        <p className={styles.description}>
                            {`ยินดีต้อนรับสู่ ${partner.name} เราให้บริการเติมเกมที่ดีที่สุด ส่งทันที และปลอดภัย`}
                        </p>
                    </div>

                    <div className={styles.linksSection}>
                        <div className={styles.linkGroup}>
                            <h4>บริการของเรา</h4>
                            <div className={styles.links}>
                                <Link href={`/store/${partner.domain}/games`} className={styles.link}>
                                    เติมเกมส์ออนไลน์
                                </Link>
                                <Link href={`/store/${partner.domain}/customer/topup`} className={styles.link}>
                                    เติมเครดิต
                                </Link>
                            </div>
                        </div>

                        <div className={styles.linkGroup}>
                            <h4>ติดต่อเรา</h4>
                            <div className={styles.links}>
                                <Link href={`/store/${partner.domain}/contact`} className={styles.link}>
                                    ติดต่อเรา
                                </Link>
                                <Link href={`/store/${partner.domain}/faq`} className={styles.link}>
                                    Q&A คำถามยอดฮิต
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
