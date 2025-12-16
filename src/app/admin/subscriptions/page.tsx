'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { getPlans, createPlan, updatePlan, togglePlanStatus } from './actions'
import { Edit2, Package, CheckCircle, XCircle } from 'lucide-react'

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', price: '', duration: '30', features: '' })

    const fetchPlans = async () => {
        const res = await getPlans()
        if (res.success) setPlans(res.data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchPlans()
    }, [])

    const handleCreate = () => {
        setEditingPlan(null)
        setFormData({ name: '', price: '', duration: '30', features: '' })
        setIsModalOpen(true)
    }

    const handleEdit = (plan: any) => {
        setEditingPlan(plan)
        setFormData({
            name: plan.name,
            price: plan.price.toString(),
            duration: plan.duration.toString(),
            features: plan.features || ''
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name: formData.name,
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration),
            features: formData.features
        }

        if (editingPlan) {
            await updatePlan(editingPlan.id, payload)
        } else {
            await createPlan(payload)
        }

        await fetchPlans()
        setIsModalOpen(false)
        setLoading(false)
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await togglePlanStatus(id, !currentStatus)
        fetchPlans()
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>Subscription Plans</h1>
                <Button onClick={handleCreate} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Package size={18} /> New Plan
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {plans.map((plan) => (
                    <Card key={plan.id} style={{ position: 'relative', border: plan.isActive ? '1px solid #e2e8f0' : '1px solid #fee2e2' }}>
                        {!plan.isActive && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                INACTIVE
                            </div>
                        )}
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: '0 0 4px' }}>{plan.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>฿{Number(plan.price).toLocaleString()}</span>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>/ {plan.duration} Days</span>
                            </div>
                        </div>

                        <div style={{ minHeight: '80px', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#475569' }}>
                            {plan.features ? (
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    {plan.features.split('\n').map((f: string, i: number) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description</span>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button
                                variant={plan.isActive ? 'secondary' : 'primary'}
                                onClick={() => handleToggle(plan.id, plan.isActive)}
                                style={{ background: plan.isActive ? '#f1f5f9' : '#10b981', color: plan.isActive ? '#64748b' : 'white' }}
                            >
                                {plan.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                {plan.isActive ? ' Disable' : ' Enable'}
                            </Button>
                            <Button variant="outline" onClick={() => handleEdit(plan)}>
                                <Edit2 size={16} /> Edit
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlan ? 'Edit Plan' : 'Create New Plan'}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                        label="Plan Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="e.g. Starter Plan"
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input
                            label="Price (THB)"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            min="0"
                            style={{ width: '100%' }}
                        />
                        <Input
                            label="Duration (Days)"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            required
                            min="1"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Features (One per line)</label>
                        <textarea
                            value={formData.features}
                            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                            rows={4}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                            placeholder="- Full Game Access&#10;- 24/7 Support&#10;- Free Setup"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Plan</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
