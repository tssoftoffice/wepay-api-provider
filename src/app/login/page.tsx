'use client'

import React, { useState, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6']

function LoginForm() {
    const router = useRouter()
    const { t } = useLanguage()
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [primaryColor, setPrimaryColor] = useState(colors[0]) // Default Orange

    const { login } = useAuth()

    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Login failed')
            }

            // Update Auth Context
            login(data.user)

            // Show success modal
            setShowSuccessModal(true)

            // Delay redirect
            setTimeout(() => {
                // Redirect based on role
                if (data.user.role === 'ADMIN') {
                    router.push('/admin/dashboard')
                } else if (data.user.role === 'PARTNER_OWNER' || data.user.role === 'PARTNER_STAFF') {
                    router.push('/partner/dashboard')
                } else if (data.user.role === 'PROVIDER_ADMIN') {
                    router.push('/provider/dashboard')
                } else {
                    router.push('/')
                }
                router.refresh()
            }, 2500)

        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div
            className={styles.container}
            style={{
                '--primary-color': primaryColor,
                '--secondary-color': colors[(colors.indexOf(primaryColor) + 1) % colors.length]
            } as React.CSSProperties}
        >
            <Link href="/" className={styles.backButton}>
                ← หน้าหลัก
            </Link>

            {/* Color Sidebar */}
            <div className={styles.sidebar}>
                {colors.map((color) => (
                    <div
                        key={color}
                        className={`${styles.colorDot} ${primaryColor === color ? styles.active : ''}`}
                        style={{ background: color }}
                        onClick={() => setPrimaryColor(color)}
                    />
                ))}
            </div>

            <div className={styles.contentWrapper}>
                {/* 3D Character */}
                {/* MMO Characters - 4 Corners */}
                <img src="/mmo_char_1.png" alt="Character 1" className={`${styles.character} ${styles.char1}`} />
                <img src="/mmo_char_2.png" alt="Character 2" className={`${styles.character} ${styles.char2}`} />
                <img src="/mmo_char_3.png" alt="Character 3" className={`${styles.character} ${styles.char3}`} />
                <img src="/mmo_char_4.png" alt="Character 4" className={`${styles.character} ${styles.char4}`} />

                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <img src="/logo.jpg" alt="GamesFlows Logo" style={{ width: '120px', height: 'auto', borderRadius: '50%' }} />
                    </div>
                    <h1 className={styles.title}>{t.auth.loginTitle}</h1>
                    <p className={styles.subtitle}>{t.auth.loginSubtitle}</p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>{t.auth.username}</label>
                            <input
                                className={styles.input}
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>{t.auth.password}</label>
                            <input
                                className={styles.input}
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                            />
                        </div>

                        <button type="submit" disabled={loading} className={styles.submitButton}>
                            {loading ? t.auth.loggingIn : t.auth.login}
                        </button>

                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center', position: 'relative', zIndex: 50 }}>
                        <Link href="/forgot-password" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'inline-block', padding: '5px' }}>
                            {t.auth.forgotPassword || 'ลืมรหัสผ่าน?'}
                        </Link>
                    </div>

                    <div className={styles.footer}>
                        <p className={styles.agentLink} style={{ fontSize: '0.95rem' }}>
                            {t.auth.wantToBeAgent} <Link href="/register/agent" className={styles.link}>{t.auth.applyHere}</Link>
                        </p>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showSuccessModal}
                onClose={() => { }} // Prevent closing manually during redirect
                title="เข้าสู่ระบบสำเร็จ"
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                    <p>ยินดีต้อนรับกลับเข้าสู่ระบบ</p>
                    <p style={{ fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.8)' }}>กำลังเข้าสู่หน้าหลัก...</p>
                </div>
            </Modal>
        </div >
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}
