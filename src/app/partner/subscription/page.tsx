'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './page.module.css'

export default function SubscriptionPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [qrCode, setQrCode] = useState('')
    const [transactionId, setTransactionId] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (showModal && transactionId && !isSuccess) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/payment/subscription/status?transactionId=${transactionId}`)
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
            }, 3000) // Poll every 3 seconds
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [showModal, transactionId, isSuccess, router])

    const handleRenew = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/payment/subscription', {
                method: 'POST'
            })
            const data = await res.json()

            if (data.success && data.qrImage) {
                setQrCode(data.qrImage)
                setTransactionId(data.transactionId)
                setIsSuccess(false)
                setShowModal(true)
            } else {
                alert('Failed to create payment: ' + data.error)
            }
        } catch (error) {
            alert('Error creating payment')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t.subscription.title}</h1>

            <Card className={styles.card}>
                <div className={styles.planInfo}>
                    <h2>{t.subscription.starterPlan}</h2>
                    <div className={styles.price}>1 THB <span className={styles.period}>{t.subscription.pricePerMonth}</span></div>
                    <ul className={styles.features}>
                        <li>✓ {t.subscription.feature1}</li>
                        <li>✓ {t.subscription.feature2}</li>
                        <li>✓ {t.subscription.feature3}</li>
                    </ul>
                </div>

                <div className={styles.action}>
                    <Button onClick={handleRenew} disabled={loading} className={styles.renewButton}>
                        {loading ? t.subscription.processing : `${t.subscription.renew} (1 THB)`}
                    </Button>
                </div>
            </Card>

            <Modal isOpen={showModal} onClose={() => !isSuccess && setShowModal(false)} title={isSuccess ? "Payment Successful!" : "Scan to Pay"}>
                <div className={styles.qrContainer}>
                    {isSuccess ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                            <h3 style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t.subscription.paymentSuccess}</h3>
                            <p style={{ color: '#6b7280' }}>{t.subscription.redirecting}</p>
                        </div>
                    ) : (
                        qrCode && (
                            <>
                                <div className={styles.qrHeader}>
                                    <div className={styles.qrTitle}>{t.subscription.totalPayment}</div>
                                    <div className={styles.qrAmount}>฿1.00</div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <img
                                        src={qrCode}
                                        alt="Payment QR Code"
                                        style={{ width: '240px', height: '240px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px' }}
                                    />
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div className={styles.qrRef}>
                                        {t.subscription.ref} {transactionId}
                                    </div>
                                    <p className={styles.instruction} style={{ fontSize: '1rem', fontWeight: 500, color: '#334155' }}>
                                        {t.subscription.scanInstruction}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                        {t.subscription.timeLimit}
                                    </p>
                                </div>
                            </>
                        )
                    )}
                </div>
            </Modal>
        </div>
    )
}
