'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './page.module.css'

export default function PartnerSettingsPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        template: 'default',
        contact: {
            lineId: '',
            facebook: '',
            email: ''
        }
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
                    template: (themeConfig as any).template || 'default',
                    contact: {
                        lineId: (themeConfig as any).contact?.lineId || '',
                        facebook: (themeConfig as any).contact?.facebook || '',
                        email: (themeConfig as any).contact?.email || ''
                    }
                })
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch('/api/partner/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    domain: formData.domain,
                    themeConfig: {
                        template: formData.template,
                        contact: formData.contact
                    }
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update settings')
            }

            setSuccess(t.settings.successMessage)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className={styles.container}>{t.settings.loading}</div>

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t.settings.title}</h1>

            <Card className={styles.card}>
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit}>


                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>{t.settings.contactInfo || 'Contact Information'}</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Line ID</label>
                            <Input
                                value={formData.contact.lineId}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    contact: { ...formData.contact, lineId: e.target.value }
                                })}
                                placeholder="@example"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Facebook</label>
                            <Input
                                value={formData.contact.facebook}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    contact: { ...formData.contact, facebook: e.target.value }
                                })}
                                placeholder="Page Name or URL"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <Input
                                value={formData.contact.email}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    contact: { ...formData.contact, email: e.target.value }
                                })}
                                placeholder="contact@example.com"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={saving} className={styles.button}>
                        {saving ? t.settings.saving : t.settings.saveChanges}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
