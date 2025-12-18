'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import styles from '../login/page.module.css' // Reuse login styles

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [debugLink, setDebugLink] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')
        setDebugLink('')

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            console.log('Response status:', res.status)
            const data = await res.json()
            console.log('Response data:', data)

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setStatus('success')
            setMessage('เราได้ส่งลิงก์สำหรับตั้งค่ารหัสผ่านใหม่ไปที่อีเมลของคุณแล้ว (หากอีเมลนี้มีอยู่ในระบบ)')
            if (data.debugLink) {
                setDebugLink(data.debugLink)
            }
        } catch (err: any) {
            setStatus('error')
            setMessage(err.message)
        }
    }

    return (
        <div className={styles.container} style={{ '--primary-color': '#f59e0b', '--secondary-color': '#3b82f6' } as any}>
            <Link href="/login" className={styles.backButton}>
                ← กลับไปหน้าเข้าสู่ระบบ
            </Link>

            <div className={styles.contentWrapper}>
                <div className={styles.card}>
                    <h1 className={styles.title}>ลืมรหัสผ่าน?</h1>
                    <p className={styles.subtitle}>กรอกอีเมลของคุณเพื่อรับลิงก์ตั้งค่ารหัสผ่านใหม่</p>

                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📧</div>
                            <p style={{ color: '#10b981', marginBottom: '20px' }}>{message}</p>

                            {/* DEMO/DEV MODE LINK */}
                            {debugLink && (
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#fbbf24', marginBottom: '5px' }}>[DEV MODE] Mock Email Link:</p>
                                    <a href={debugLink} style={{ color: '#60a5fa', wordBreak: 'break-all' }}>
                                        Click here to Reset Password
                                    </a>
                                </div>
                            )}

                            <Link href="/login" style={{ color: '#f59e0b', textDecoration: 'none' }}>
                                กลับไปหน้าเข้าสู่ระบบ
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {status === 'error' && <div className={styles.error}>{message}</div>}

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>อีเมล</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your-email@example.com"
                                />
                            </div>

                            <button type="submit" disabled={status === 'loading'} className={styles.submitButton}>
                                {status === 'loading' ? 'กำลังส่ง...' : 'ส่งลิงก์กู้คืนรหัสผ่าน'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
