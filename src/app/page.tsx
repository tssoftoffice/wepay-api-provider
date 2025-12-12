'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HomePage() {
    const router = useRouter()
    const { t } = useLanguage()

    return (
        <div className={styles.agentContainer}>
            {/* Navbar Placeholder */}
            <nav className={styles.navbar}>
                <div className={styles.logo}>GamesFlows</div>
                <div className={styles.navLinks}>
                    <Link href="/">Home</Link>
                    <Link href="#">Games</Link>
                    <Link href="#">About</Link>
                    <Link href="#">Contact</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>{t.agentLanding.heroTitle}</h1>
                    <p>{t.agentLanding.heroSubtitle}</p>
                    <Link href="/register/agent" className={styles.ctaButton}>
                        {t.agentLanding.heroBtn}
                    </Link>
                </div>
                <div className={styles.heroImage}>
                    <img src="/hero_orange.png" alt="Hero Gamer" />
                </div>
            </section>

            {/* Cards Section */}
            <section className={styles.cardsSection}>
                {/* Card 1: Cat Cup */}
                <div className={styles.featureCard}>
                    <div className={styles.iconWrapper}>
                        <img src="/feature_rocket_orange.png" alt="Start Immediately" className={styles.cardImage} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>{t.agentLanding.feature1Title}</h3>
                        <p>{t.agentLanding.feature1Desc}</p>
                    </div>
                </div>

                {/* Card 2: Robot */}
                <div className={styles.featureCard}>
                    <div className={styles.iconWrapper}>
                        <img src="/feature_auto_orange.png" alt="Auto System" className={styles.cardImage} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>{t.agentLanding.feature2Title}</h3>
                        <p>{t.agentLanding.feature2Desc}</p>
                    </div>
                </div>

                {/* Card 3: Coins */}
                <div className={styles.featureCard}>
                    <div className={styles.iconWrapper}>
                        <img src="/feature_profit_orange.png" alt="High Profit" className={styles.cardImage} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>{t.agentLanding.feature3Title}</h3>
                        <p>{t.agentLanding.feature3Desc}</p>
                    </div>
                </div>

                {/* CTA Button */}
                {/* New Dark CTA Section (Hostinger Style) */}
                <section className={styles.ctaSection}>
                    <h2>สมัครใช้งานฟรี</h2>
                    <p>เริ่มต้นภายใน 1 นาที ระบบอัตโนมัติ 24 ชั่วโมง</p>
                    <Link href="/register/agent" className={styles.ctaSectionButton}>
                        เริ่มเลย
                    </Link>
                </section>

            </section>

            {/* About Section */}
            <section className={styles.aboutSection}>
                <div className={styles.aboutContent}>
                    <h4>About GamesFlows</h4>
                    <h2>{t.agentLanding.aboutTitle}</h2>
                    <p>{t.agentLanding.aboutDesc}</p>
                </div>
                <div className={styles.aboutImage}>
                    <div className={styles.placeholderImage}>
                        <img src="/about_dashboard_orange.png" alt="GamesFlows Dashboard" />
                    </div>
                </div>
            </section>

            {/* Register/Pricing Section (Single Plan - Restored) */}
            <section id="register-section" className={styles.registerSection}>
                <h2>แพ็กเกจเจ้าของร้าน</h2>

                <div className={styles.subscriptionCard}>
                    <h3>Starter Plan</h3>
                    <div className={styles.priceTag}>
                        1,199 <span className={styles.currency}>THB</span> <span className={styles.period}>/ เดือน</span>
                    </div>
                    <p className={styles.subCardDesc}>เริ่มต้นเป็นเจ้าของธุรกิจร้านเติมเกมได้ง่ายๆ</p>

                    <ul className={styles.planFeatures}>
                        <li><span className={styles.checkIcon}>✓</span> ระบบเติมเกมอัตโนมัติ 24 ชม.</li>
                        <li><span className={styles.checkIcon}>✓</span> กำไรสูง ไม่ต้องสต็อกสินค้า</li>
                        <li><span className={styles.checkIcon}>✓</span> มีทีมงานซัพพอร์ตตลอดเวลา</li>
                        <li><span className={styles.checkIcon}>✓</span> แดชบอร์ดจัดการร้านค้า</li>
                        <li><span className={styles.checkIcon}>✓</span> รองรับทุกเกมฮิต</li>
                    </ul>

                    <Button
                        className={styles.submitButton}
                        onClick={() => router.push('/register/agent')}
                    >
                        สมัครสมาชิกเลย
                    </Button>
                </div>
            </section>

           

        </div>
    )
}
