'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Copy } from 'lucide-react'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

export function TopupContent() {
    const { t } = useLanguage()
    const router = useRouter()
    const [amount, setAmount] = useState('') // Keep amount field as reference or suggestion
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false) // Use modal for success only now
    const [successData, setSuccessData] = useState<{ amount: number, transactionId: string } | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            const objectUrl = URL.createObjectURL(selected)
            setPreview(objectUrl)
            setError('')
        }
    }

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            setError('กรุณาแนบสลิปโอนเงิน (Please upload slip)')
            return
        }

        setLoading(true)
        setError('')

        try {
            const base64 = await convertToBase64(file)

            const res = await fetch('/api/payment/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount) || 0, // Optional
                    slipImage: base64
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            if (data.success) {
                setSuccessData(data)
                setShowModal(true)
                // Clear form
                setFile(null)
                setPreview('')
                setAmount('')
                // Redirect after delay
                setTimeout(() => {
                    router.push('/partner/dashboard')
                    router.refresh()
                }, 3000)
            }

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <h1 className={styles.title}>{t.topup.title} (แนบสลิป)</h1>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Bank Details Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #00A950 0%, #007638 100%)',
                        borderRadius: '16px',
                        padding: '20px',
                        color: 'white',
                        marginBottom: '24px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '16px',
                                overflow: 'hidden'
                            }}>
                                <img src="/kbank_logo.png?v=2" alt="KBANK" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>ธนาคารกสิกรไทย (KBANK)</div>
                                <div style={{ fontSize: '18px', fontWeight: 600 }}>บจก. ทีเอสซอฟท์</div>
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            gap: '12px'
                        }}
                            onClick={() => {
                                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                    navigator.clipboard.writeText('2168765358');
                                }
                            }}
                        >
                            <span style={{
                                fontSize: 'clamp(16px, 5vw, 20px)',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                whiteSpace: 'nowrap',
                                fontFamily: 'monospace'
                            }}>
                                216-8-76535-8
                            </span>
                            <span style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '8px',
                                borderRadius: '8px',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Copy size={18} />
                            </span>
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                            แนบสลิปการโอนเงิน
                        </label>
                        <div
                            style={{
                                border: '2px dashed rgba(255,255,255,0.3)',
                                borderRadius: '12px',
                                padding: '32px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'rgba(255,255,255,0.05)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={() => document.getElementById('slip-upload')?.click()}
                        >
                            {preview ? (
                                <img src={preview} alt="Slip Preview" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '8px' }} />
                            ) : (
                                <div style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>คลิกเพื่อเลือกรูปภาพ</p>
                                    <p style={{ fontSize: '0.9rem' }}>หรือลากไฟล์มาวางที่นี่</p>
                                </div>
                            )}
                            <input
                                id="slip-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className={styles.button}>
                        {loading ? 'กำลังตรวจสอบ...' : 'ยืนยันการเติมเงิน'}
                    </Button>
                </form>

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="">
                    <div className={styles.qrContainer}>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>เติมเงินสำเร็จ!</h3>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                ยอดเงิน {successData?.amount.toLocaleString()} บาท เข้ากระเป๋าเรียบร้อยแล้ว
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px', fontSize: '0.9rem' }}>กำลังกลับไปที่แดชบอร์ด...</p>
                        </div>
                    </div>
                </Modal>
            </Card>
        </div>
    )
}
