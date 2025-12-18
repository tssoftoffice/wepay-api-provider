'use client'

import React from 'react'
import Link from 'next/link'

import styles from './TemplateDark.module.css'

interface TemplateProps {
    partner: any
    domain: string
}

export function TemplateDark({ partner, domain }: TemplateProps) {


    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <header className={styles.hero}>
                <div className={styles.heroContent}>
                    {partner.logoUrl ? (
                        <img src={partner.logoUrl} alt="Logo" className={styles.logo} />
                    ) : (
                        <div className={styles.logoPlaceholder}>{partner.name.charAt(0)}</div>
                    )}
                    <h1 className={styles.storeName}>{partner.name}</h1>
                    <p className={styles.storeDesc}>
                        {`ยินดีต้อนรับสู่ ${partner.name} เราให้บริการเติมเกมที่ดีที่สุด ส่งทันที และปลอดภัย`}
                    </p>
                </div>
            </header>

            {/* Game Section */}
            <main className={styles.main}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🎮</span>
                        บริการเติมเกมออนไลน์
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
                                <div className={styles.cardPrice}>เริ่มต้น {game.minPrice} บาท</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}
