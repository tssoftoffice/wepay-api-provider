'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

import Navbar from '@/components/Navbar'

export default function HomePage() {
    const router = useRouter()
    const { t } = useLanguage()

    return (
        <div className={styles.agentContainer}>
            <Navbar />

            {/* Hero Section */}

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.animateFadeInUp}>{t.agentLanding.heroTitle}</h1>
                    <p className={`${styles.animateFadeInUp} ${styles.delay100}`}>{t.agentLanding.heroSubtitle}</p>
                    <Link href="/register/agent" className={`${styles.ctaButton} ${styles.animateFadeInUp} ${styles.delay200}`}>
                        {t.agentLanding.heroBtn}
                    </Link>
                </div>
                <div className={`${styles.heroImage} ${styles.animateFadeInUp} ${styles.delay300}`}>
                    <img src="/hero_orange.png" alt="Hero Gamer" className={styles.animateFloat} />
                </div>
            </section>

            {/* Cards Section */}
            <section className={styles.cardsSection}>
                {/* Card 1: Cat Cup */}
                <div className={`${styles.featureCard} ${styles.animateFadeInUp} ${styles.delay200}`}>
                    <div className={styles.iconWrapper}>
                        <img src="/feature_rocket_orange.png" alt="Start Immediately" className={styles.cardImage} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>{t.agentLanding.feature1Title}</h3>
                        <p>{t.agentLanding.feature1Desc}</p>
                    </div>
                </div>

                {/* Card 2: Robot */}
                <div className={`${styles.featureCard} ${styles.animateFadeInUp} ${styles.delay300}`}>
                    <div className={styles.iconWrapper}>
                        <img src="/feature_auto_orange.png" alt="Auto System" className={styles.cardImage} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>{t.agentLanding.feature2Title}</h3>
                        <p>{t.agentLanding.feature2Desc}</p>
                    </div>
                </div>

                {/* Card 3: Coins */}
                <div className={`${styles.featureCard} ${styles.animateFadeInUp} ${styles.delay400}`}>
                    <div className={styles.iconWrapper}>
                        <img src="/feature_profit_orange.png" alt="High Profit" className={styles.cardImage} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>{t.agentLanding.feature3Title}</h3>
                        <p>{t.agentLanding.feature3Desc}</p>
                    </div>
                </div>





            </section>

            {/* Services Section (New) */}
            <section id="services" className={styles.servicesSection}>
                <div className={styles.servicesHeader}>
                    <h2>{t.agentLanding.servicesTitle}</h2>
                </div>
                <div className={styles.servicesGrid}>
                    {/* Service 1: API */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        </div>
                        <h3>{t.agentLanding.service1Title}</h3>
                        <p>{t.agentLanding.service1Desc}</p>
                    </div>

                    {/* Service 2: Auto */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                        </div>
                        <h3>{t.agentLanding.service2Title}</h3>
                        <p>{t.agentLanding.service2Desc}</p>
                    </div>

                    {/* Service 3: Structure */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                        </div>
                        <h3>{t.agentLanding.service3Title}</h3>
                        <p>{t.agentLanding.service3Desc}</p>
                    </div>

                    {/* Service 4: Security */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <h3>{t.agentLanding.service4Title}</h3>
                        <p>{t.agentLanding.service4Desc}</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className={styles.aboutSection}>
                <div className={`${styles.aboutContent} ${styles.animateFadeInUp}`}>
                    <h4>About GamesFlows</h4>
                    <h2>{t.agentLanding.aboutTitle}</h2>
                    <p>{t.agentLanding.aboutDesc}</p>
                </div>
                <div className={styles.aboutImage}>
                    <div className={`${styles.placeholderImage} ${styles.animateFadeInUp} ${styles.delay200}`}>
                        <img src="/about_dashboard_orange.png" alt="GamesFlows Dashboard" />
                    </div>
                </div>
            </section>

            {/* Register/Pricing Section (Single Plan - Restored) */}
            <section id="register-section" className={styles.registerSection}>
                <h2>แพ็กเกจเจ้าของร้าน</h2>

                <div className={`${styles.subscriptionCard} ${styles.animateFadeInUp}`}>
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
