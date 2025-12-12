'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

export function TopupContent() {
    const { t } = useLanguage()
    const router = useRouter()
    const [amount, setAmount] = useState('')
    const [qrCode, setQrCode] = useState('')
    const [transactionId, setTransactionId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (showModal && transactionId && !isSuccess) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/payment/topup/status?transactionId=${transactionId}`)
                    const data = await res.json()

                    if (data.status === 'SUCCESS' || data.status === 'SUCCEEDED') {
                        clearInterval(interval)
                        setIsSuccess(true)
                        setTimeout(() => {
                            router.push('/partner/dashboard')
                            router.refresh()
                        }, 3000)
                    }
                } catch (error) {
                    console.error('Polling error:', error)
                }
            }, 3000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [showModal, transactionId, isSuccess, router])

    const handleTopup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setQrCode('')
        setIsSuccess(false)

        try {
            const res = await fetch('/api/payment/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount) }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Topup failed')
            }

            if (data.success && data.qrImage) {
                setQrCode(data.qrImage)
                setTransactionId(data.transactionId)
                setShowModal(true)
            } else {
                throw new Error('Failed to generate QR Code')
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
                <h1 className={styles.title}>{t.topup.title}</h1>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleTopup} className={styles.form}>
                    <div>
                        <label htmlFor="amount" style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                            {t.topup.amount}
                        </label>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="1"
                            placeholder="ระบุจำนวนเงิน (THB)"
                            className={styles.input} /* We will rely on cascading or add this class */
                            style={{
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '1.1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <Button type="submit" disabled={loading} className={styles.button}>
                        {loading ? t.topup.generating : t.topup.generateQr}
                    </Button>
                </form>

                <Modal isOpen={showModal} onClose={() => !isSuccess && setShowModal(false)} title="">
                    <div className={styles.qrContainer}>
                        {isSuccess ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                                <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Payment Successful!</h3>
                                <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Redirecting to dashboard...</p>
                            </div>
                        ) : (
                            qrCode && (
                                <>
                                    <div className={styles.qrHeader}>
                                        <div className={styles.qrTitle}>ยอดชำระเงิน (Total)</div>
                                        <div className={styles.qrAmount}>฿{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <img
                                            src={qrCode}
                                            alt="Payment QR Code"
                                            style={{ width: '240px', height: '240px', objectFit: 'contain', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px', padding: '10px', background: 'white' }}
                                        />
                                    </div>

                                    <div style={{ textAlign: 'center' }}>
                                        <div className={styles.qrRef} style={{ color: 'white' }}>
                                            REF: {transactionId}
                                        </div>
                                        <p className={styles.instruction} style={{ fontSize: '1rem', fontWeight: 500, color: 'white' }}>
                                            {t.topup.scanToPay}
                                        </p>
                                        <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>
                                            กรุณาชำระเงินภายใน 15 นาที
                                        </p>
                                    </div>
                                </>
                            )
                        )}
                    </div>
                </Modal>
            </Card>
        </div>
    )
}
