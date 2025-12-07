'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const roleParam = searchParams.get('role')
    const isAgent = roleParam === 'PARTNER_OWNER'

    const { t } = useLanguage()

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'CUSTOMER', // Default to customer for this form
        storeName: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            // Show success modal
            setShowSuccessModal(true)

            // Delay redirect
            setTimeout(() => {
                router.push('/')
                router.refresh()
            }, 2500)

        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    // Form for Customer Registration
    const FormContent = (
        <Card className={styles.card}>
            <h1 className={styles.title}>{t.auth.registerTitle}</h1>
            <p className={styles.subtitle}>{t.auth.registerSubtitle}</p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label={t.auth.username}
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <Input
                    label={t.auth.password}
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <Input
                    label={t.auth.email}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <Button type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? t.auth.creatingAccount : t.auth.register}
                </Button>
            </form>

            <p className={styles.footer}>
                {t.auth.alreadyHaveAccount} <Link href="/login" className={styles.link}>{t.auth.login}</Link>
            </p>
        </Card>
    )

    if (!isAgent) {
        return (
            <div className={styles.customerContainer}>
                <div className={styles.contentWrapper}>
                    {/* 3D Character */}
                    <div className={styles.characterWrapper}>
                        <img src="/register_customer_character.png" alt="Register Character" className={styles.character} />
                    </div>
                    {FormContent}
                </div>
                <Modal
                    isOpen={showSuccessModal}
                    onClose={() => { }}
                    title="สมัครสมาชิกสำเร็จ"
                >
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
                        <p>สมัครสมาชิกเรียบร้อยแล้ว</p>
                        <p style={{ fontSize: '0.9em', color: '#666' }}>กำลังเข้าสู่ระบบ...</p>
                    </div>
                </Modal>
            </div>
        )
    }

    // Agent Landing Page
    return (
        <div className={styles.agentContainer}>
            {/* Navbar Placeholder */}
            <nav className={styles.navbar}>
                <div className={styles.logo}>EvoPlayShop</div>
                <div className={styles.navLinks}>
                    <Link href="/">Home</Link>
                    <Link href="#">Games</Link>
                    <Link href="#">Careers</Link>
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

                {/* Card 4: CTA (Register Form) */}
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

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
        </Suspense>
    )
}
