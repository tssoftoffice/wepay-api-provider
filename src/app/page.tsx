'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import styles from './page.module.css'

import Navbar from '@/components/Navbar'

interface Plan {
    id: string
    name: string
    price: number
    duration: number
    features: string
    isActive: boolean
}

export default function HomePage() {
    const router = useRouter()
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/plans')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPlans(data)
                }
            })
            .catch(err => console.error('Failed to fetch plans', err))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className={styles.agentContainer}>
            <Navbar />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.animateFadeInUp}>API เติมเกมระดับมืออาชีพ เสถียร ปลอดภัย รองรับการเติบโตของธุรกิจคุณ</h1>
                    <p className={`${styles.animateFadeInUp} ${styles.delay100}`}>เราให้บริการ API เติมเกมแบบครบวงจรสำหรับผู้ที่ต้องการเปิดเว็บไซต์เติมเกมของตัวเองโดยไม่ต้องดูแลระบบหลังบ้านที่ซับซ้อน</p>
                    <Link href="/register/agent" className={`${styles.ctaButton} ${styles.animateFadeInUp} ${styles.delay200}`}>
                        สมัครตัวแทนเลย
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
                        <h3>เปิดร้านเติมเกมได้ทันที ไม่ต้องพัฒนาระบบหลังบ้านเอง</h3>
                        <p>พร้อมใช้งานสำหรับผู้เริ่มต้นและเจ้าของร้านออนไลน์</p>
                    </div>
                </div>

                {/* Card 2: Robot */}
                <div className={`${styles.featureCard} ${styles.animateFadeInUp} ${styles.delay300}`}>
                    <div className={styles.iconWrapper}>
                        <img src="/feature_auto_orange.png" alt="Auto System" className={styles.cardImage} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>ระบบเติมเกมอัตโนมัติ 100%</h3>
                        <p>ทำงานตลอด 24 ชั่วโมง เชื่อมต่อ API โดยตรง</p>
                    </div>
                </div>

                {/* Card 3: Coins */}
                <div className={`${styles.featureCard} ${styles.animateFadeInUp} ${styles.delay400}`}>
                    <div className={styles.iconWrapper}>
                        <img src="/feature_profit_orange.png" alt="High Profit" className={styles.cardImage} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>บริหารกำไรได้เองแบบมืออาชีพ</h3>
                        <p>ตั้งราคาเอง คุมต้นทุน และขยายธุรกิจได้อิสระ</p>
                    </div>
                </div>





            </section>

            {/* Services Section (New) */}
            <section id="services" className={styles.servicesSection}>
                {/* Decoration Images */}
                <img src="/char_boss.png" alt="" className={`${styles.decorationImage} ${styles.decorationLeft}`} />
                <img src="/mmo_warrior.png" alt="" className={`${styles.decorationImage} ${styles.decorationRight}`} />

                <div className={styles.servicesHeader}>
                    <h2>บริการของเรา</h2>
                </div>
                <div className={styles.servicesGrid}>
                    {/* Service 1: API */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>
                            <img src="/service_link_3d.png" alt="API Service" className={styles.serviceIconImage} />
                        </div>
                        <h3>บริการ API เติมเกม</h3>
                        <p>ให้บริการระบบ API เติมเกมแบบครบวงจร รองรับการเชื่อมต่อเว็บไซต์เติมเกม รวดเร็ว เสถียร และพร้อมใช้งานเชิงธุรกิจ</p>
                    </div>

                    {/* Service 2: Auto */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>
                            <img src="/service_flash_3d.png" alt="Auto System" className={styles.serviceIconImage} />
                        </div>
                        <h3>ระบบเติมเกมอัตโนมัติ</h3>
                        <p>ระบบประมวลผลคำสั่งเติมเกมบริการแบบเรียลไทม์ ทำงานอัตโนมัติ 24 ชั่วโมง ช่วยลดขั้นตอนและต้นทุนการดำเนินงาน</p>
                    </div>

                    {/* Service 3: Structure */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>
                            <img src="/service_layout_3d.png" alt="Portal Structure" className={styles.serviceIconImage} />
                        </div>
                        <h3>โครงสร้างสำหรับเจ้าของเว็บ</h3>
                        <p>ออกแบบมาเพื่อเจ้าของเว็บไซต์เติมเกมโดยเฉพาะ กำหนดรูปแบบการขายและราคาด้วยตัวเอง พร้อมต่อยอดและขยายธุรกิจในอนาคต</p>
                    </div>

                    {/* Service 4: Security */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceIcon}>
                            <img src="/service_shield_3d.png" alt="Security" className={styles.serviceIconImage} />
                        </div>
                        <h3>ความปลอดภัยและความเสถียร</h3>
                        <p>ระบบมีการตรวจสอบคำสั่งซ้ำและความถูกต้อง ป้องกันข้อผิดพลาดระหว่างการใช้งาน มั่นใจได้ในทุกคำสั่งเติมเกม</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className={styles.aboutSection}>
                <div className={`${styles.aboutContent} ${styles.animateFadeInUp}`}>
                    <h4>About GamesFlows</h4>
                    <h2>GamesFlows คืออะไร?</h2>
                    <p>GamesFlows คือแพลตฟอร์มเติมเกมที่ทันสมัยที่สุด เรามุ่งมั่นที่จะให้บริการที่รวดเร็ว ปลอดภัย และคุ้มค่าที่สุดสำหรับเกมเมอร์ทุกคน ด้วยระบบอัตโนมัติที่ทำงานตลอด 24 ชั่วโมง คุณจึงมั่นใจได้ว่าธุรกิจของคุณจะดำเนินไปได้อย่างราบรื่นไม่มีสะดุด มาร่วมเป็นส่วนหนึ่งกับเราและเติบโตไปด้วยกัน</p>
                </div>
                <div className={styles.aboutImage}>
                    <div className={`${styles.placeholderImage} ${styles.animateFadeInUp} ${styles.delay200}`}>
                        <img src="/about_dashboard_orange.png" alt="GamesFlows Dashboard" />
                    </div>
                </div>
            </section>

            {/* Pricing Section (Dynamic) */}
            <section id="register-section" className={styles.registerSection}>
                <h2>แพ็กเกจเจ้าของร้าน</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>กำลังโหลดข้อมูลแพ็กเกจ...</div>
                ) : plans.length > 0 ? (
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1200px' }}>
                        {plans.map((plan) => (
                            <div key={plan.id} className={`${styles.subscriptionCard} ${styles.animateFadeInUp}`}>
                                <h3>{plan.name}</h3>
                                <div className={styles.priceTag}>
                                    {Number(plan.price).toLocaleString()} <span className={styles.currency}>THB</span> <span className={styles.period}>/ {plan.duration} วัน</span>
                                </div>
                                <p className={styles.subCardDesc}>เริ่มต้นเป็นเจ้าของธุรกิจร้านเติมเกมได้ง่ายๆ</p>

                                {plan.features && (
                                    <ul className={styles.planFeatures}>
                                        {plan.features.split('\n').filter(Boolean).map((feature: string, idx: number) => (
                                            <li key={idx}><span className={styles.checkIcon}>✓</span> {feature}</li>
                                        ))}
                                    </ul>
                                )}

                                <Button
                                    className={styles.submitButton}
                                    onClick={() => router.push('/register/agent')}
                                >
                                    สมัครสมาชิกเลย
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>ไม่พบแพ็กเกจที่เปิดใช้งาน</div>
                )}
            </section>

        </div>
    )
}
