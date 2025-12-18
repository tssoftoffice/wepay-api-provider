'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from '../login/page.module.css' // Reuse login styles

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setStatus('error')
            setMessage('รหัสผ่านไม่ตรงกัน')
            return
        }

        if (!token) {
            setStatus('error')
            setMessage('ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน')
            return
        }

        setStatus('loading')
        setMessage('')

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setStatus('success')
            setMessage('ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว')

            setTimeout(() => {
                router.push('/login')
            }, 3000)

        } catch (err: any) {
            setStatus('error')
            setMessage(err.message)
        }
    }

    if (!token) {
        return (
            <div className={styles.container} style={{ '--primary-color': '#f59e0b', '--secondary-color': '#3b82f6' } as any}>
                <div className={styles.contentWrapper}>
                    <div className={styles.card}>
                        <h1 className={styles.title}>ข้อผิดพลาด</h1>
                        <p className={styles.error}>ลิงก์ไม่ถูกต้องหรือหมดอายุ</p>
                        <Link href="/login" className={styles.backButton} style={{ position: 'static', display: 'block', textAlign: 'center', marginTop: '20px' }}>
                            กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container} style={{ '--primary-color': '#f59e0b', '--secondary-color': '#3b82f6' } as any}>
            <div className={styles.contentWrapper}>
                <div className={styles.card}>
                    <h1 className={styles.title}>ตั้งรหัสผ่านใหม่</h1>
                    <p className={styles.subtitle}>กรุณากรอกรหัสผ่านใหม่ของคุณ</p>

                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                            <p style={{ color: '#10b981', marginBottom: '20px' }}>{message}</p>
                            <p>กำลังกลับไปหน้าเข้าสู่ระบบ...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {status === 'error' && <div className={styles.error}>{message}</div>}

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>รหัสผ่านใหม่</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="New Password"
                                    minLength={6}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>ยืนยันรหัสผ่านใหม่</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm New Password"
                                    minLength={6}
                                />
                            </div>

                            <button type="submit" disabled={status === 'loading'} className={styles.submitButton}>
                                {status === 'loading' ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
