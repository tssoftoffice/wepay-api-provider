'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import styles from './page.module.css'

export default function CustomerTopupPage() {
    const [selectedMethod, setSelectedMethod] = useState<'TRUEMONEY' | 'SLIP'>('SLIP')
    const [amount, setAmount] = useState('')
    const [slipUrl, setSlipUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [fileName, setFileName] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            // In a real app, upload here. For now, mock URL
            setSlipUrl('https://mock-slip.com/uploaded-slip.jpg')
        }
    }

    const handleTopup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            const res = await fetch('/api/customer/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    slipUrl: slipUrl || 'https://mock-slip.com/slip.jpg'
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Topup request failed')
            }

            setSuccess(true)
            setAmount('')
            setSlipUrl('')
            setFileName('')

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>ช่องทางการชำระเงิน</h1>
                    <div className={styles.breadcrumb}>หน้าหลัก / รายการทั้งหมด</div>
                </div>

                <div className={styles.grid}>
                    {/* Sidebar - Payment Methods */}
                    <div className={styles.paymentMethods}>
                        <div
                            className={`${styles.methodCard} ${selectedMethod === 'TRUEMONEY' ? styles.active : ''}`}
                            onClick={() => setSelectedMethod('TRUEMONEY')}
                        >
                            <div className={styles.methodIcon}>🧧</div>
                            <div className={styles.methodInfo}>
                                <div className={styles.methodTitle}>Truemoney อั่งเปา</div>
                                <div className={styles.methodDesc}>เติมเงินผ่านซองของขวัญ</div>
                            </div>
                            {selectedMethod === 'TRUEMONEY' && <div className={styles.checkIcon}>✓</div>}
                        </div>

                        <div
                            className={`${styles.methodCard} ${selectedMethod === 'SLIP' ? styles.active : ''}`}
                            onClick={() => setSelectedMethod('SLIP')}
                        >
                            <div className={styles.methodIcon}>📄</div>
                            <div className={styles.methodInfo}>
                                <div className={styles.methodTitle}>ยืนยัน Slip-Qrcode</div>
                                <div className={styles.methodDesc}>ยืนยันสลิปผ่าน QR-CODE</div>
                            </div>
                            {selectedMethod === 'SLIP' && <div className={styles.checkIcon}>✓</div>}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className={styles.contentArea}>
                        {selectedMethod === 'SLIP' ? (
                            <>
                                {/* Bank Details Card */}
                                <div className={styles.bankCard}>
                                    <div className={styles.logoOverlay}>KBANK</div>
                                    <div className={styles.bankHeader}>
                                        <div className={styles.bankTitle}>ช่องทางการชำระเงิน</div>
                                        <div className={styles.bankSubtitle}>เลขบัญชี</div>
                                    </div>
                                    <div className={styles.accountInfo}>
                                        <div className={styles.accountNumber}>159-1-73530-2</div>
                                        <div className={styles.bankName}>ธนาคาร กสิกรไทย</div>
                                        <div className={styles.bankName}>ชื่อบัญชี : บจก. อีโว เพลย์ช็อป</div>
                                    </div>
                                </div>

                                {/* Topup Form */}
                                <div className={styles.formSection}>
                                    <div className={styles.feeWarning}>⛔ ค่าธรรมเนียม 0 %</div>

                                    {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                                    {success && <div className="text-green-500 text-center mb-4">แจ้งเติมเงินเรียบร้อย รอการตรวจสอบ</div>}

                                    <form onSubmit={handleTopup}>
                                        <div className={styles.inputGroup}>
                                            <Input
                                                label="จำนวนเงินที่โอน"
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="ระบุจำนวนเงิน"
                                                required
                                                min="10"
                                            />
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>หลักฐานการโอนเงิน</label>
                                            <div className={styles.fileInputWrapper} onClick={() => document.getElementById('slip-upload')?.click()}>
                                                {fileName ? (
                                                    <span className={styles.fileName}>{fileName}</span>
                                                ) : (
                                                    <span>คลิกเพื่อเลือกไฟล์สลิป หรือ ลากไฟล์มาวางที่นี่</span>
                                                )}
                                                <input
                                                    id="slip-upload"
                                                    type="file"
                                                    className={styles.fileInput}
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={loading} className={styles.submitBtn}>
                                            {loading ? 'กำลังทำรายการ...' : 'ยืนยันการเติมเงิน'}
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className={styles.formSection}>
                                <h2 className={styles.formTitle}>Truemoney Angpao</h2>
                                <p className="text-center text-gray-500">ระบบกำลังปรับปรุง กรุณาใช้ช่องทาง Slip-QRCode</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.helpSection}>
                    <div className={styles.helpTitle}>พบเจอปัญหาในการเติมอยู่ ?</div>
                    <a href="#" className="text-blue-500 hover:underline">วิธีการเติมเงินเข้าเว็บ ?</a>
                </div>
            </div>
        </div>
    )
}
