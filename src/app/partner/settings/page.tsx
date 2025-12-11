'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './page.module.css'
import { Copy, Check, Save } from 'lucide-react'

export default function PartnerSettingsPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [copied, setCopied] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        apiKey: '',
        callbackUrl: '',
        domain: '', // Keep for internal state even if not shown
        template: 'default'
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/partner/settings')
            const data = await res.json()
            if (data.partner) {
                let themeConfig = {}
                try {
                    themeConfig = JSON.parse(data.partner.themeConfig || '{}')
                } catch (e) { }

                setFormData({
                    name: data.partner.name,
                    domain: data.partner.domain || '',
                    apiKey: data.partner.apiKey || '',
                    description: (themeConfig as any).description || '',
                    callbackUrl: (themeConfig as any).callbackUrl || '',
                    template: (themeConfig as any).template || 'default'
                })
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err)
            showMessage('error', 'Failed to load settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            // Construct payload
            // We store description and callbackUrl in themeConfig
            const payload = {
                name: formData.name,
                // domain: formData.domain, // Don't update domain here unless explicitly requested
                themeConfig: {
                    template: formData.template,
                    description: formData.description,
                    callbackUrl: formData.callbackUrl,
                    // Persist other potential config if we had it, but we are replacing structure mostly
                }
            }

            const res = await fetch('/api/partner/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update settings')
            }

            showMessage('success', 'บันทึกข้อมูลเรียบร้อยแล้ว')
        } catch (err: any) {
            showMessage('error', err.message)
        } finally {
            setSaving(false)
        }
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        if (type === 'success') {
            setTimeout(() => setMessage(null), 3000)
        }
    }

    const copyApiKey = () => {
        if (formData.apiKey) {
            navigator.clipboard.writeText(formData.apiKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (loading) return <div className={styles.container}>Loading...</div>

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t.settings.title}</h1>

            <Card className={styles.card}>
                {message && (
                    <div className={`${styles.message} ${message.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Shop Profile Section */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>ข้อมูลร้านค้า (Store Profile)</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>ชื่อร้านค้า (Shop Name)</label>
                            <input
                                className={styles.input}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="My Game Shop"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>รายละเอียดร้านค้า (Description)</label>
                            <textarea
                                className={styles.textarea}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="รายละเอียดร้านค้าของคุณ..."
                            />
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2rem 0' }} />

                    {/* API Configuration Section */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>การตั้งค่า API (API Configuration)</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>API Key</label>
                            <div className={styles.inputGroup}>
                                <input
                                    className={styles.input}
                                    value={formData.apiKey}
                                    readOnly
                                    type="text"
                                    style={{ fontFamily: 'monospace', color: '#64748b', background: '#f1f5f9' }}
                                />
                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    onClick={copyApiKey}
                                    title="Copy API Key"
                                >
                                    {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                ใช้ Key นี้สำหรับเชื่อมต่อ API (ห้ามเปิดเผยให้ผู้อื่นรู้)
                            </p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Callback URL (Webhook)</label>
                            <input
                                className={styles.input}
                                value={formData.callbackUrl}
                                onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
                                placeholder="https://your-website.com/api/callback"
                            />
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                URL สำหรับรับการแจ้งเตือนสถานะรายการ (POST Request)
                            </p>
                        </div>
                    </div>

                    <Button type="submit" disabled={saving} className={styles.button}>
                        {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
