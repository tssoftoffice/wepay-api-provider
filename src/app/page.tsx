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
                <div className={styles.logo}>EvoPlayShop</div>
                <div className={styles.navLinks}>
                    <Link href="/">Home</Link>
                    <Link href="#">Games</Link>
                    {/* <Link href="#">Careers</Link> */}
                    <Link href="#">About</Link>
                    <Link href="#">Contact</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>{t.agentLanding.heroTitle}</h1>
                    <p>{t.agentLanding.heroSubtitle}</p>
                </div>
                <div className={styles.heroImage}>
                    <img src="/agent_hero_cat.png" alt="Hero Cat" />
                </div>
            </section>

            {/* Cards Section */}
            <section className={styles.cardsSection}>
                {/* Card 1: Cat Cup */}
                <div className={`${styles.featureCard} ${styles.cardPurple}`}>
                    <img src="/feature_cat_cup.png" alt="Cat Cup" className={styles.cardImage} />
                    <div className={styles.cardContent}>
                        <h3>{t.agentLanding.feature1Title}</h3>
                        <p>{t.agentLanding.feature1Desc}</p>
                    </div>
                </div>

                {/* Card 2: Robot */}
                <div className={`${styles.featureCard} ${styles.cardRed}`}>
                    <img src="/feature_robot.png" alt="Robot" className={styles.cardImage} />
                    <div className={styles.cardContent}>
                        <h3>{t.agentLanding.feature2Title}</h3>
                        <p>{t.agentLanding.feature2Desc}</p>
                    </div>
                </div>

                {/* Card 3: Coins */}
                <div className={`${styles.featureCard} ${styles.cardGold}`}>
                    <img src="/feature_coins.png" alt="Coins" className={styles.cardImage} />
                    <div className={styles.cardContent}>
                        <h3>{t.agentLanding.feature3Title}</h3>
                        <p>{t.agentLanding.feature3Desc}</p>
                    </div>
                </div>

                {/* Card 4: CTA (Register Form - Scroll to section) */}
                <div className={`${styles.featureCard} ${styles.cardYellow} ${styles.ctaCard}`} onClick={() => document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    <div className={styles.ctaContent}>
                        <h3>{t.agentLanding.ctaTitle}</h3>
                        <p>{t.agentLanding.ctaSubtitle}</p>
                        <div className={styles.arrowDown}>↓</div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className={styles.aboutSection}>
                <div className={styles.aboutContent}>
                    <h4>About EvoPlayShop</h4>
                    <h2>{t.agentLanding.aboutTitle}</h2>
                    <p>{t.agentLanding.aboutDesc}</p>
                </div>
                <div className={styles.aboutImage}>
                    <div className={styles.placeholderImage}>
                        <img src="/feature_robot.png" alt="About Us" />
                    </div>
                </div>
            </section>

            {/* Subscription / Register Section */}
            <section className={styles.registerSection} id="register-section">
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

            {/* Footer */}
            <footer className={styles.agentFooter}>
                <div className={styles.footerContent}>
                    <div className={styles.footerLogo}>EvoPlayShop</div>
                    <div className={styles.footerLinks}>
                        <Link href="/">{t.agentLanding.footerLinks.home}</Link>
                        <Link href="#">{t.agentLanding.footerLinks.games}</Link>
                        <Link href="#">{t.agentLanding.footerLinks.about}</Link>
                        <Link href="#">{t.agentLanding.footerLinks.contact}</Link>
                    </div>
                    <div className={styles.footerSocials}>
                        {/* Social Icons Placeholders */}
                        <div className={styles.socialIcon}>FB</div>
                        <div className={styles.socialIcon}>IG</div>
                        <div className={styles.socialIcon}>TW</div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>{t.agentLanding.copyright}</p>
                    <div className={styles.legalLinks}>
                        <Link href="#">{t.agentLanding.footerLinks.privacy}</Link>
                        <Link href="#">{t.agentLanding.footerLinks.terms}</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
