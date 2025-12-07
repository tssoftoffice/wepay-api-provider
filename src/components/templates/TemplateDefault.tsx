'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './TemplateDefault.module.css'

interface TemplateProps {
    partner: any
    domain: string
}

export function TemplateDefault({ partner, domain }: TemplateProps) {
    const { t } = useLanguage()

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <header className={styles.hero}>
                {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt="Logo" className={styles.logo} />
                ) : (
                    <div className={styles.logoPlaceholder}>{partner.name.charAt(0)}</div>
                )}
                <h1 className={styles.storeName}>{partner.name}</h1>
                <p className={styles.storeDesc}>
                    {t.templates.welcomeMessage.replace('{storeName}', partner.name)}
                </p>
            </header>

            {/* Game Topup Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🎮</span>
                        {t.templates.gameTopup}
                    </h2>
                </div>

                <div className={styles.grid}>
                    {partner.games.map((game: any) => (
                        <Link key={game.id} href={`/store/${domain}/game/${game.id}`} className={styles.card}>
                            <div className={styles.cardImage}>
                                {game.imageUrl ? (
                                    <img src={game.imageUrl} alt={game.name} />
                                ) : (
                                    <span>{game.name[0]}</span>
                                )}
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardTitle}>{game.name}</div>
                                <div className={styles.cardPrice}>฿{Number(game.minPrice).toLocaleString()}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Other Services Section (Mock) */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>📱</span>
                        {t.templates.otherServices}
                    </h2>
                </div>

                <div className={styles.serviceGrid}>
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>📱</div>
                        <div className={styles.serviceInfo}>
                            <h4>{t.templates.mobileTopup}</h4>
                            <p>{t.templates.mobileTopupDesc}</p>
                        </div>
                    </div>
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>💳</div>
                        <div className={styles.serviceInfo}>
                            <h4>{t.templates.billPayment}</h4>
                            <p>{t.templates.billPaymentDesc}</p>
                        </div>
                    </div>
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>🎁</div>
                        <div className={styles.serviceInfo}>
                            <h4>{t.templates.giftCards}</h4>
                            <p>{t.templates.giftCardsDesc}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
