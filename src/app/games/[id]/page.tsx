import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function MainGameDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)

    // Mock data for now since we don't have a "Main Site" partner in DB yet
    // In a real app, this would fetch from a default partner or admin products
    const gameName = "Game " + id

    return (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Left: Image */}
                <div>
                    <div style={{
                        aspectRatio: '3/4',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                    }}>
                        {gameName[0]}
                    </div>
                </div>

                {/* Right: Form */}
                <div>
                    <Card style={{ padding: '2rem' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            Topup {gameName}
                        </h1>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Player ID
                            </label>
                            <Input placeholder="Enter Player ID" />
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                            Select Package
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <button key={i} style={{
                                    padding: '1rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    background: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{i * 100} Diamonds</div>
                                    <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>{i * 35} THB</div>
                                </button>
                            ))}
                        </div>

                        <Button style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}>
                            Buy Now
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
