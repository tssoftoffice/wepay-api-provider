'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './TemplateColorful.module.css'

interface TemplateProps {
    partner: any
    domain: string
}

export function TemplateColorful({ partner, domain }: TemplateProps) {
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

            {/* Game Section */}
            <main className={styles.main}>
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

                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}
