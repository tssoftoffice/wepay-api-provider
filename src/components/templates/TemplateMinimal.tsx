'use client'

import React from 'react'
import Link from 'next/link'

import styles from './TemplateMinimal.module.css'

interface TemplateProps {
    partner: any
    domain: string
}

export function TemplateMinimal({ partner, domain }: TemplateProps) {

    const games = partner.games || []

    return (
        <div className={styles.container}>
            {/* Decorative blobs */}
            <div className={`${styles.decoration} ${styles.blob1}`} />
            <div className={`${styles.decoration} ${styles.blob2}`} />

            {/* Hero Section */}
            <header className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.logoWrapper}>
                        {partner.name.charAt(0).toUpperCase()}
                    </div>
                    <h1 className={styles.storeName}>{partner.name}</h1>
                    <p className={styles.welcomeMsg}>
                        ยินดีต้อนรับสู่ {partner.name} บริการเติมเกม 24 ชม.
                    </p>
                    <Link href={`/store/${domain}/games`}>
                        <button className={styles.shopNowBtn}>ซื้อสินค้าเลย</button>
                    </Link>
                </div>
            </header>

            {/* Service Highlights */}
            <section className={styles.highlights}>
                <div className={styles.highlightItem}>
                    <span className={styles.icon}>⚡</span>
                    <span>ระบบอัตโนมัติ</span>
                </div>
                <div className={styles.highlightItem}>
                    <span className={styles.icon}>💰</span>
                    <span>ราคาประหยัด</span>
                </div>
                <div className={styles.highlightItem}>
                    <span className={styles.icon}>🛡️</span>
                    <span>ปลอดภัยหายห่วง</span>
                </div>
                <div className={styles.highlightItem}>
                    <span className={styles.icon}>🎧</span>
                    <span>ช่วยเหลือทันใจ</span>
                </div>
            </section>

            {/* Game Grid */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>🎮</div>
                    <h2 className={styles.sectionTitle}>บริการเติมเกมออนไลน์</h2>
                </div>

                <div className={styles.grid}>
                    {games.map((game: any) => (
                        <Link href={`/store/${domain}/game/${game.id}`} key={game.id} className={styles.card}>
                            <div className={styles.cardImage}>
                                {game.name.charAt(0)}
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardTitle}>{game.name}</div>
                                <div className={styles.cardPrice}>
                                    เริ่มต้นเพียง ฿{Number(game.minPrice).toLocaleString()}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Other Services */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>✨</div>
                    <h2 className={styles.sectionTitle}>บริการอื่นๆ</h2>
                </div>

                <div className={styles.grid}>
                    <Link href="#" className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>📱</div>
                        <div className={styles.serviceInfo}>
                            <h3>เติมเงินมือถือ</h3>
                            <p>AIS, DTAC, TrueMove</p>
                        </div>
                    </Link>
                    <Link href="#" className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>💳</div>
                        <div className={styles.serviceInfo}>
                            <h3>ชำระบิล</h3>
                            <p>Water, Electric, Internet</p>
                        </div>
                    </Link>
                    <Link href="#" className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>🎁</div>
                        <div className={styles.serviceInfo}>
                            <h3>บัตรของขวัญ</h3>
                            <p>Netflix, Spotify, Apple</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
