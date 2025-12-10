'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './page.module.css'
import { getActivePlans } from './actions'

export default function SubscriptionPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [plans, setPlans] = useState<any[]>([])
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [qrCode, setQrCode] = useState('')
    const [transactionId, setTransactionId] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        getActivePlans().then(res => {
            if (res.success && res.data) {
                setPlans(res.data)
                if (res.data.length > 0) setSelectedPlan(res.data[0].id)
            }
        })
    }, [])

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
            }, 3000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [showModal, transactionId, isSuccess, router])

    const handleRenew = async () => {
        if (!selectedPlan) return
        setLoading(true)
        try {
            const res = await fetch('/api/payment/subscription', {
                method: 'POST',
                body: JSON.stringify({ planId: selectedPlan }),
                headers: { 'Content-Type': 'application/json' }
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

    const selectedPlanDetails = plans.find(p => p.id === selectedPlan)

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t.subscription.title}</h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                {plans.length === 0 ? (
                    <Card><p style={{ textAlign: 'center', padding: '20px' }}>No active plans available.</p></Card>
                ) : (
                    plans.map(plan => (
                        <Card
                            key={plan.id}
                            className={styles.card}
                            style={{
                                border: selectedPlan === plan.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            <div className={styles.planInfo}>
                                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{plan.name}</h2>
                                <div className={styles.price}>
                                    {parseInt(plan.price).toLocaleString()} THB
                                    <span className={styles.period}> / {plan.duration} Days</span>
                                </div>
                                <div className={styles.features} style={{ marginTop: '12px' }}>
                                    {plan.features ? (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {plan.features.split('\n').map((f: string, i: number) => (
                                                <li key={i} style={{ marginBottom: '4px', fontSize: '14px', color: '#475569' }}>
                                                    ✓ {f}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description</p>
                                    )}
                                </div>
                            </div>

                            {selectedPlan === plan.id && (
                                <div className={styles.action} style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); handleRenew(); }}
                                        disabled={loading}
                                        className={styles.renewButton}
                                    >
                                        {loading ? t.subscription.processing : `${t.subscription.renew} (${parseInt(plan.price)} THB)`}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>

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
                                    <div className={styles.qrAmount}>
                                        ฿{selectedPlanDetails ? Number(selectedPlanDetails.price).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                                    </div>
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
