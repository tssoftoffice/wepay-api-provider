'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './TemplateModern.module.css'

interface TemplateProps {
    partner: any
    domain: string
}

export function TemplateModern({ partner, domain }: TemplateProps) {
    const { t } = useLanguage()

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <header className={styles.hero}>
                <div className={styles.heroContent}>
                    {partner.logoUrl ? (
                        <img src={partner.logoUrl} alt="Logo" className={styles.partnerLogo} />
                    ) : (
                        <div className={styles.partnerLogoPlaceholder}>{partner.name.charAt(0)}</div>
                    )}
                    <h1>{partner.name}</h1>
                    <h2>{t.templates.gameTopupStation}</h2>
                    <p className={styles.heroSubtitle}>
                        {t.templates.fastSecureReliable}
                    </p>
                    <Link href="#games">
                        <button className={styles.shopNowBtn}>{t.templates.topupNow}</button>
                    </Link>
                </div>
            </header>

            {/* Service Highlights */}
            <section className={styles.highlights}>
                <div className={styles.highlightItem}>
                    <span className={styles.icon}>⚡</span>
                    <span>{t.templates.autoSystem}</span>
                </div>
                <div className={styles.highlightItem}>
                    <span className={styles.icon}>💰</span>
                    <span>{t.templates.bestPrice}</span>
                </div>
                <div className={styles.highlightItem}>
                    <span className={styles.icon}>🛡️</span>
                    <span>{t.templates.secure100}</span>
                </div>
                <div className={styles.highlightItem}>
                    <span className={styles.icon}>🎧</span>
                    <span>{t.templates.support247}</span>
                </div>
            </section>

            {/* Game Grid */}
            <main className={styles.main} id="games">
                <div className={styles.sectionHeader}>
                    <h3>{t.templates.gameTopup}</h3>
                </div>

                <div className={styles.gameGrid}>
                    {partner.games.map((game: any) => (
                        <Link key={game.id} href={`/store/${domain}/game/${game.id}`} className={styles.gameCard}>
                            <div className={styles.gameImagePlaceholder}>
                                {game.imageUrl ? (
                                    <img src={game.imageUrl} alt={game.name} />
                                ) : (
                                    <span>{game.name[0]}</span>
                                )}
                            </div>
                            <p className={styles.gameName}>{game.name}</p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}
