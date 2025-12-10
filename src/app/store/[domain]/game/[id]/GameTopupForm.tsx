'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'
import Swal from 'sweetalert2'
import styles from './page.module.css'

interface GamePrice {
    id: string
    name: string
    price: number | string
    sellPrice: number | string
    description?: string
}

interface GameTopupFormProps {
    gameId: string
    gameName: string
    gamePrices: GamePrice[]
    domain: string
    servers?: { value: string, name: string }[] | null
}

export function GameTopupForm({ gameId, gameName, gamePrices, domain, servers }: GameTopupFormProps) {
    const { t } = useLanguage()
    const [playerId, setPlayerId] = useState('')
    const [selectedServer, setSelectedServer] = useState('')
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const router = useRouter()

    const selectedPkg = gamePrices.find(p => p.id === selectedPackage)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!playerId || !selectedPackage) return
        if (servers && !selectedServer) {
            Swal.fire({
                icon: 'warning',
                title: t.errors.selectServer,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            })
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/game/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId: gameId,
                    priceId: selectedPackage,
                    playerId,
                    server: selectedServer || undefined
                })
            })

            const data = await res.json()

            if (!res.ok) {
                let errorMessage = data.error || t.errors.topupFailed

                // Map known errors
                if (errorMessage.includes('Insufficient customer balance')) errorMessage = t.errors.insufficientBalance
                if (errorMessage.includes('Item not available')) errorMessage = t.errors.unknown

                throw new Error(errorMessage)
            }

            // Success
            await Swal.fire({
                icon: 'success',
                title: t.errors.success,
                text: t.errors.successMessage,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            })

            // Redirect to history
            router.push(`/store/${domain}/customer/history`)
            router.refresh()

        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: t.errors.topupFailed,
                text: err.message,
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK'
            })
        } finally {
            setLoading(false)
        }
    }

    const cleanDescription = (html: string) => {
        // Remove prices like "90 บาท", "1,000 THB", "90THB"
        return html.replace(/[0-9,]+(\.[0-9]+)?\s*(บาท|THB|Baht)/gi, '')
    }

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h1 className={styles.gameTitle}>เติมเกม : {gameName}</h1>
                <p className={styles.warning}>หากกรอก ID ผิด ร้านจะไม่รับผิดชอบทุกกรณี กรุณาเช็คให้เรียบร้อย</p>
            </div>

            {/* Legacy Error Box (Optional, can remove if SweetAlert is enough) */}
            {/* {error && (
                <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )} */}

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>1</span>
                    <h3>กรอก ID เกมของท่าน</h3>
                </div>
                <input
                    type="text"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="กรอก ID เกมของคุณ"
                    className={styles.input}
                />
                <p className={styles.helperText}>* กรุณากรอก ID ก่อนเลือกสินค้า *</p>

                {servers && servers.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <select
                            value={selectedServer}
                            onChange={(e) => setSelectedServer(e.target.value)}
                            className={styles.input}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        >
                            <option value="">กรุณาเลือก Server เกม</option>
                            {servers.map((server) => (
                                <option key={server.value} value={server.value}>
                                    {server.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>2</span>
                    <h3>เลือกรายการที่ต้องการเติม</h3>
                </div>

                <div className={styles.packageGrid}>
                    {gamePrices.map((pkg) => (
                        <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedPackage(pkg.id)}
                            className={`${styles.packageCard} ${selectedPackage === pkg.id ? styles.selected : ''}`}
                            style={{ height: 'auto', minHeight: '120px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                {pkg.description ? (
                                    <SafeHtml html={cleanDescription(pkg.description)} />
                                ) : (
                                    <div className={styles.packageName}>{pkg.name}</div>
                                )}
                            </div>
                            <div className={styles.packagePrice} style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4ade80', marginTop: '0.5rem' }}>
                                {Number(pkg.sellPrice).toLocaleString()} THB
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={loading || !selectedPackage || !playerId}
                className={styles.submitButton}
                style={{ marginTop: '2rem', width: '100%' }}
            >
                {loading ? 'กำลังทำรายการ...' : 'สั่งซื้อสินค้า'}
            </Button>
        </div>
    )
}

function SafeHtml({ html }: { html: string }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return <div dangerouslySetInnerHTML={{ __html: html }} />
}
