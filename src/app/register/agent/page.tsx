'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { Modal } from '@/components/ui/Modal'

export default function AgentRegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        storeName: '',
        username: '',
        password: '',
        confirmPassword: '',
    })
    const [consent, setConsent] = useState(false)
    const [otp, setOtp] = useState('')
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [emailVerified, setEmailVerified] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successModal, setSuccessModal] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSendOtp = async () => {
        if (!formData.email) {
            setError('กรุณากรอกอีเมลก่อนยืนยัน')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            })
            if (!res.ok) throw new Error('Failed to send OTP')
            setShowOtpModal(true)
            setError('')
        } catch (err) {
            setError('ไม่สามารถส่ง OTP ได้ โปรดลองใหม่อีกครั้ง')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Invalid OTP')

            setEmailVerified(true)
            setShowOtpModal(false)
            setError('')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emailVerified) {
            setError('กรุณายืนยันอีเมลก่อนสมัครสมาชิก')
            return
        }
        if (!consent) {
            setError('กรุณายอมรับเงื่อนไขการใช้งาน')
            return
        }
        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                    role: 'PARTNER_OWNER',
                    storeName: formData.storeName,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Registration failed')

            setSuccessModal(true)
            setTimeout(() => {
                router.push('/partner/dashboard')
            }, 2500)

        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>สมัครสมาชิกพาร์ทเนอร์ ✨</h1>
                    <p className={styles.subtitle}>เข้าร่วมเป็นครอบครัว EvoPlayShop วันนี้</p>
                </div>

                {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>ชื่อจริง</label>
                            <input
                                className={styles.input}
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                placeholder="สมชาย"
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>นามสกุล</label>
                            <input
                                className={styles.input}
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                placeholder="ใจดี"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>เบอร์โทรศัพท์</label>
                        <input
                            className={styles.input}
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="0812345678"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>อีเมล</label>
                        <input
                            className={styles.input}
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="example@email.com"
                            disabled={emailVerified}
                        />
                        {!emailVerified ? (
                            <button type="button" onClick={handleSendOtp} className={styles.verifyButton} disabled={loading}>
                                {loading ? 'กำลังส่ง...' : 'ยืนยันอีเมล (รับ OTP)'}
                            </button>
                        ) : (
                            <div className={styles.verifiedBadge}>✓ ยืนยันอีเมลแล้ว</div>
                        )}
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px dashed #e5e7eb', margin: '1rem 0' }} />

                    <div className={styles.field}>
                        <label className={styles.label}>ชื่อร้านค้า</label>
                        <input
                            className={styles.input}
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            required
                            placeholder="My Awesome Shop"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>ชื่อผู้ใช้ (Username)</label>
                        <input
                            className={styles.input}
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="username"
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>รหัสผ่าน</label>
                            <input
                                className={styles.input}
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>ยืนยันรหัสผ่าน</label>
                            <input
                                className={styles.input}
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.consentSection}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                            />
                            <span>
                                ข้าพเจ้ายอมรับเงื่อนไขการใช้งาน และยืนยันว่าจะไม่นำแพลตฟอร์มนี้ไปใช้ในทางที่ผิดกฎหมาย หรือสนับสนุนการกระทำความผิดใดๆ
                            </span>
                        </label>
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading || !emailVerified || !consent}>
                        {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
                    </button>
                </form>

                <div className={styles.backLink}>
                    <a href="/register">ย้อนกลับ</a>
                </div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className={styles.otpOverlay}>
                    <div className={styles.otpModal}>
                        <h3 className={styles.otpTitle}>กรอกรหัส OTP</h3>
                        <p style={{ marginBottom: '1rem', color: '#666' }}>รหัส OTP ถูกส่งไปยังอีเมลของคุณแล้ว (Test: 123456)</p>
                        <input
                            className={styles.otpInput}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            placeholder="000000"
                        />
                        <div className={styles.otpButtons}>
                            <button onClick={() => setShowOtpModal(false)} className={styles.cancelButton}>ยกเลิก</button>
                            <button onClick={handleVerifyOtp} className={styles.confirmButton} disabled={loading}>ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={successModal}
                onClose={() => { }}
                title="สมัครสมาชิกสำเร็จ"
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
                    <p>ยินดีต้อนรับพาร์ทเนอร์คนใหม่!</p>
                    <p style={{ fontSize: '0.9em', color: '#666' }}>กำลังเข้าสู่ระบบ...</p>
                </div>
            </Modal>
        </div>
    )
}
