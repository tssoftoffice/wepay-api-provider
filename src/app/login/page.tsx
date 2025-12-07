'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

function LoginForm() {
    const router = useRouter()
    const { t } = useLanguage()
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

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
                if (data.user.role === 'PARTNER_OWNER' || data.user.role === 'PARTNER_STAFF') {
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
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                {/* 3D Character */}
                <div className={styles.characterWrapper}>
                    <img src="/login_character.png" alt="Login Character" className={styles.character} />
                </div>

                <Card className={styles.card}>
                    <h1 className={styles.title}>{t.auth.loginTitle}</h1>
                    <p className={styles.subtitle}>{t.auth.loginSubtitle}</p>

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

                        <Button type="submit" disabled={loading} className={styles.submitButton}>
                            {loading ? t.auth.loggingIn : t.auth.login}
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p>{t.auth.dontHaveAccount} <Link href="/register" className={styles.link}>{t.auth.register}</Link></p>
                        <p className={styles.agentLink}>
                            {t.auth.wantToBeAgent} <Link href="/register?role=PARTNER_OWNER" className={styles.link}>{t.auth.applyHere}</Link>
                        </p>
                    </div>
                </Card>
            </div>

            <Modal
                isOpen={showSuccessModal}
                onClose={() => { }} // Prevent closing manually during redirect
                title="เข้าสู่ระบบสำเร็จ"
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                    <p>ยินดีต้อนรับกลับเข้าสู่ระบบ</p>
                    <p style={{ fontSize: '0.9em', color: '#666' }}>กำลังเข้าสู่หน้าหลัก...</p>
                </div>
            </Modal>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}
