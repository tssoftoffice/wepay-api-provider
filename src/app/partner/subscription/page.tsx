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
            <h1 className={styles.title}>Subscription Management</h1>

            <Card className={styles.card}>
                <div className={styles.planInfo}>
                    <h2>Starter Plan</h2>
                    <div className={styles.price}>1 THB <span className={styles.period}>/ Month</span></div>
                    <ul className={styles.features}>
                        <li>✓ 24/7 Automated System</li>
                        <li>✓ High Profit Margin</li>
                        <li>✓ Full Support</li>
                    </ul>
                </div>

                <div className={styles.action}>
                    <Button onClick={handleRenew} disabled={loading} className={styles.renewButton}>
                        {loading ? 'Processing...' : 'Renew Subscription (1 THB)'}
                    </Button>
                </div>
            </Card>

            <Modal isOpen={showModal} onClose={() => !isSuccess && setShowModal(false)} title={isSuccess ? "Payment Successful!" : "Scan to Pay"}>
                <div className={styles.qrContainer}>
                    {isSuccess ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                            <h3 style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Payment Successful!</h3>
                            <p style={{ color: '#6b7280' }}>Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        qrCode && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <img
                                        src={qrCode}
                                        alt="Payment QR Code"
                                        style={{ width: '250px', height: '250px', objectFit: 'contain' }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                    Reference ID: {transactionId}
                                </p>
                                <p className={styles.instruction}>Scan with your banking app</p>
                            </>
                        )
                    )}
                </div>
            </Modal>
        </div>
    )
}
