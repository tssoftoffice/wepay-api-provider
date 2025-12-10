'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createPartnerAction } from './actions'
import { User, Building2, Phone, Mail, Lock, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import styles from './styles.module.css'

const initialState = {
    message: '',
    error: {} as Record<string, string[]>
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className={styles.submitButton}
        >
            {pending ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    กำลังสร้าง...
                </>
            ) : (
                'สร้าง Partner'
            )}
        </button>
    )
}

export default function CreatePartnerForm() {
    const [state, formAction] = useActionState(createPartnerAction, initialState)

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin/dashboard" className={styles.backButton}>
                    <ArrowLeft size={20} />
                </Link>
                <div className={styles.title}>
                    <h1>สร้าง Partner ใหม่</h1>
                    <p>เพิ่มร้านค้าและบัญชีผู้ดูแลระบบ</p>
                </div>
            </div>

            <form action={formAction}>
                <div className={styles.grid}>
                    {/* Left Column: Personal & Store Info */}
                    <div>
                        {/* Personal Info Card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper} style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                    <User size={20} />
                                </div>
                                <h2>ข้อมูลส่วนตัว</h2>
                            </div>

                            <div className={styles.twoCols}>
                                <div className={styles.formGroup}>
                                    <label>ชื่อจริง</label>
                                    <input
                                        name="firstName"
                                        type="text"
                                        placeholder="สมชาย"
                                        className={`${styles.input} ${state?.error?.firstName ? styles.inputError : ''}`}
                                        style={{ paddingLeft: '16px' }} // No icon override
                                    />
                                    {state?.error?.firstName && (
                                        <div className={styles.errorMessage}>
                                            <AlertCircle size={12} /> {state.error.firstName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>นามสกุล</label>
                                    <input
                                        name="lastName"
                                        type="text"
                                        placeholder="ใจดี"
                                        className={`${styles.input} ${state?.error?.lastName ? styles.inputError : ''}`}
                                        style={{ paddingLeft: '16px' }}
                                    />
                                    {state?.error?.lastName && (
                                        <div className={styles.errorMessage}>
                                            <AlertCircle size={12} /> {state.error.lastName[0]}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.twoCols}>
                                <div className={styles.formGroup}>
                                    <label>เบอร์โทรศัพท์</label>
                                    <div className={styles.inputWrapper}>
                                        <Phone className={styles.inputIcon} size={18} />
                                        <input
                                            name="phone"
                                            type="tel"
                                            placeholder="0812345678"
                                            className={`${styles.input} ${state?.error?.phone ? styles.inputError : ''}`}
                                        />
                                    </div>
                                    {state?.error?.phone && (
                                        <div className={styles.errorMessage}>
                                            <AlertCircle size={12} /> {state.error.phone[0]}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>อีเมล</label>
                                    <div className={styles.inputWrapper}>
                                        <Mail className={styles.inputIcon} size={18} />
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="partner@example.com"
                                            className={`${styles.input} ${state?.error?.email ? styles.inputError : ''}`}
                                        />
                                    </div>
                                    {state?.error?.email && (
                                        <div className={styles.errorMessage}>
                                            <AlertCircle size={12} /> {state.error.email[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Store Info Card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper} style={{ background: '#e0e7ff', color: '#6366f1' }}>
                                    <Building2 size={20} />
                                </div>
                                <h2>ข้อมูลร้านค้า</h2>
                            </div>
                            <div className={styles.formGroup}>
                                <label>ชื่อร้านค้า (Store Name)</label>
                                <input
                                    name="storeName"
                                    type="text"
                                    placeholder="My Awesome Shop"
                                    className={`${styles.input} ${state?.error?.storeName ? styles.inputError : ''}`}
                                    style={{ paddingLeft: '16px' }}
                                />
                                {state?.error?.storeName && (
                                    <div className={styles.errorMessage}>
                                        <AlertCircle size={12} /> {state.error.storeName[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Account Info */}
                    <div className={styles.card} style={{ height: 'fit-content' }}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper} style={{ background: '#d1fae5', color: '#10b981' }}>
                                <ShieldCheck size={20} />
                            </div>
                            <h2>ข้อมูลบัญชีผู้ดูแล (Admin)</h2>
                        </div>

                        <div className={styles.infoBox}>
                            บัญชีนี้จะเป็น <strong>Super Admin</strong> ของร้านค้า สามารถจัดการสินค้า การเงิน และพนักงานได้ทั้งหมด
                        </div>

                        <div className={styles.formGroup}>
                            <label>ชื่อผู้ใช้ (Username)</label>
                            <div className={styles.inputWrapper}>
                                <User className={styles.inputIcon} size={18} />
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="admin_shop"
                                    className={`${styles.input} ${state?.error?.username ? styles.inputError : ''}`}
                                />
                            </div>
                            {state?.error?.username && (
                                <div className={styles.errorMessage}>
                                    <AlertCircle size={12} /> {state.error.username[0]}
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>รหัสผ่าน</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} size={18} />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className={`${styles.input} ${state?.error?.password ? styles.inputError : ''}`}
                                />
                            </div>
                            {state?.error?.password && (
                                <div className={styles.errorMessage}>
                                    <AlertCircle size={12} /> {state.error.password[0]}
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>ยืนยันรหัสผ่าน</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} size={18} />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className={`${styles.input} ${state?.error?.confirmPassword ? styles.inputError : ''}`}
                                />
                            </div>
                            {state?.error?.confirmPassword && (
                                <div className={styles.errorMessage}>
                                    <AlertCircle size={12} /> {state.error.confirmPassword[0]}
                                </div>
                            )}
                        </div>

                        {state?.message && (
                            <div className={styles.serverMessage}>
                                {state.message}
                            </div>
                        )}

                        <SubmitButton />
                    </div>
                </div>
            </form>
            <style jsx global>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
