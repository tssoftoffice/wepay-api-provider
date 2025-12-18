'use client'

import React from 'react'
import Link from 'next/link'

import styles from './TemplateDefault.module.css'

interface TemplateProps {
    partner: any
    domain: string
}

export function TemplateDefault({ partner, domain }: TemplateProps) {


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
                    {`ยินดีต้อนรับสู่ ${partner.name} เราให้บริการเติมเกมที่ดีที่สุด ส่งทันที และปลอดภัย`}
                </p>
            </header>

            {/* Game Topup Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🎮</span>
                        บริการเติมชั่วโมงเกม
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
                        บริการอื่นๆ
                    </h2>
                </div>

                <div className={styles.serviceGrid}>
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>📱</div>
                        <div className={styles.serviceInfo}>
                            <h4>เติมเงินมือถือ</h4>
                            <p>รองรับทุกเครือข่าย AIS, DTAC, TRUE</p>
                        </div>
                    </div>
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>💳</div>
                        <div className={styles.serviceInfo}>
                            <h4>ชำระบิล</h4>
                            <p>ค่าน้ำ ค่าไฟ อินเทอร์เน็ต และอื่นๆ</p>
                        </div>
                    </div>
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>🎁</div>
                        <div className={styles.serviceInfo}>
                            <h4>บัตรของขวัญ</h4>
                            <p>Google Play, iTunes, Netflix, etc.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
