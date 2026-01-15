'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Copy, Gift, Building2 } from 'lucide-react'
import styles from './page.module.css'

type TopupMethod = 'BANK' | 'TRUEMONEY'

export function TopupContent() {

    const router = useRouter()
    const [method, setMethod] = useState<TopupMethod>('BANK')

    // Bank State
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>('')

    // TrueMoney State
    const [tmLink, setTmLink] = useState('')

    // Common State
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
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

    const handleBankSubmit = async (e: React.FormEvent) => {
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
                body: JSON.stringify({ amount: 0, slipImage: base64 }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')

            handleSuccess(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleTrueMoneySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!tmLink) {
            setError('กรุณากรอกลิงก์ซองของขวัญ')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/payment/truemoney', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ link: tmLink }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.details || data.error || 'TrueMoney failed')

            handleSuccess(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSuccess = (data: any) => {
        setSuccessData(data)
        setShowModal(true)
        setFile(null)
        setPreview('')
        setTmLink('')
        setTimeout(() => {
            router.push('/partner/dashboard')
            router.refresh()
        }, 3000)
    }

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <h1 className={styles.title}>เติมเครดิต</h1>

                {/* Method Selector */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setMethod('BANK')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '12px',
                            border: 'none',
                            background: method === 'BANK' ? '#00A950' : 'rgba(255,255,255,0.05)',
                            color: method === 'BANK' ? 'white' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        <Building2 size={20} />
                        โอนผ่านธนาคาร
                    </button>
                    <button
                        onClick={() => setMethod('TRUEMONEY')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '12px',
                            border: 'none',
                            background: method === 'TRUEMONEY' ? '#FF5100' : 'rgba(255,255,255,0.05)',
                            color: method === 'TRUEMONEY' ? 'white' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        <Gift size={20} />
                        TrueMoney (Wallet)
                    </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {/* BANK TRANSFER FORM */}
                {method === 'BANK' && (
                    <form onSubmit={handleBankSubmit} className={styles.form}>
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
                                        navigator.clipboard.writeText('2238051382');
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
                                    223-8-05138-2
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

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                                แนบสลิปการโอนเงิน (Slip)
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
                )}

                {/* TRUEMONEY FORM */}
                {method === 'TRUEMONEY' && (
                    <form onSubmit={handleTrueMoneySubmit} className={styles.form}>
                        {/* Header Section with Brand Colors */}
                        <div style={{
                            background: 'linear-gradient(135deg, #FF5100 0%, #FF8F00 100%)',
                            borderRadius: '16px',
                            padding: '24px',
                            color: 'white',
                            marginBottom: '24px',
                            boxShadow: '0 8px 16px rgba(255, 81, 0, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <img src="/true_wallet_logo.png" onError={(e) => e.currentTarget.src = 'https://play-lh.googleusercontent.com/e2o_5Wq3bZKjF4hB1W2F-4A6w6oJg4C4o4o_5a5x5x5x5x5x5x5x5x5x'} alt="TrueMoney" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '2px' }}>เติมผ่านซองของขวัญ</div>
                                    <div style={{ fontSize: '20px', fontWeight: 700 }}>TrueMoney Angpao</div>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(0,0,0,0.1)',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Gift size={16} />
                                <div>ค่าธรรมเนียม 2.9%</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                                ลิงก์ซองของขวัญ (Gift Link)
                            </label>
                            <Input
                                type="text"
                                placeholder="https://gift.truemoney.com/campaign/?v=..."
                                value={tmLink}
                                onChange={(e) => setTmLink(e.target.value)}
                                required
                                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                            />
                            <p style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                * สร้างซองของขวัญส่งให้ตัวเอง แล้วนำลิงก์มากรอกที่นี่
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !tmLink}
                            className={styles.button}
                            style={{
                                background: 'linear-gradient(to right, #FF5100, #FF8F00)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(255, 81, 0, 0.3)'
                            }}
                        >
                            {loading ? 'กำลังตรวจสอบ...' : 'เติมเงินทันที'}
                        </Button>
                    </form>
                )}

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

