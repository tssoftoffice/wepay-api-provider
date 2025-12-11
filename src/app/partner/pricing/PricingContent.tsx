'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { Search, Edit2, ChevronDown, ChevronRight, Gamepad2, X, Save } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

interface PricingContentProps {
    data: {
        partner: any
        games: any[]
        currentPrices: any[]
    }
    updatePriceAction: (formData: FormData) => Promise<void>
    updateGameImageAction: (formData: FormData) => Promise<void>
}

export function PricingContent({ data, updatePriceAction, updateGameImageAction }: PricingContentProps) {
    const { t } = useLanguage()

    // State
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedGroups, setExpandedGroups] = useState<string[]>([])

    // Edit Game State
    const [editingGame, setEditingGame] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Edit Group Image State
    const [editingGroup, setEditingGroup] = useState<{ name: string, imageUrl: string } | null>(null)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)

    const [loading, setLoading] = useState(false)

    // Group items
    const groupedGames = React.useMemo(() => {
        const filtered = data.games.filter(g =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.code.toLowerCase().includes(searchTerm.toLowerCase())
        )

        return filtered.reduce((acc: any, game) => {
            let company = 'Other'
            const parts = game.code.split('_')

            if (['mtopup', 'gtopup', 'cashcard'].includes(parts[0]) && parts.length >= 2) {
                company = parts[1]
            } else if (parts.length > 0) {
                company = parts[0]
            }

            // Clean company name
            company = company.toUpperCase()

            if (!acc[company]) acc[company] = []
            acc[company].push(game)
            return acc
        }, {})
    }, [data.games, searchTerm])

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        )
    }

    const handleEdit = (game: any) => {
        const price = data.currentPrices.find(p => p.gameId === game.id)
        const currentSellPrice = price ? Number(price.sellPrice) : Math.ceil(Number(game.baseCost) * 1.1)

        setEditingGame({
            ...game,
            currentSellPrice,
            currentDescription: game.description || ''
        })
        setIsModalOpen(true)
    }

    const onSave = async (formData: FormData) => {
        setLoading(true)
        await updatePriceAction(formData)
        setLoading(false)
        setIsModalOpen(false)
        setEditingGame(null)
    }

    const handleEditImage = (e: React.MouseEvent, groupName: string, imageUrl: string) => {
        e.stopPropagation()
        setEditingGroup({ name: groupName, imageUrl })
        setIsImageModalOpen(true)
    }

    const onSaveImage = async (formData: FormData) => {
        setLoading(true)
        await updateGameImageAction(formData)
        setLoading(false)
        setIsImageModalOpen(false)
        setEditingGroup(null)
    }

    return (
        <div className={styles.container} style={{ maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 className={styles.title} style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: 8, fontWeight: 700 }}>
                    {t.pricing?.title || 'Game Management'}
                </h1>
                <p style={{ color: '#64748b' }}>จัดการราคาสินค้าและรายละเอียดเกม</p>
            </div>

            {/* Search */}
            <div style={{ background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 2px 14px 0px rgba(32, 40, 45, 0.08)', marginBottom: 24 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <Input
                        placeholder="Search games..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: 48, height: 48, fontSize: 15, borderRadius: 12, border: '1px solid #e2e8f0', width: '100%' }}
                    />
                </div>
            </div>

            {/* Groups List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {Object.keys(groupedGames).length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: 16 }}>
                        No games found
                    </div>
                ) : (
                    Object.entries(groupedGames).sort().map(([groupName, items]: [string, any[]]) => {
                        const isExpanded = expandedGroups.includes(groupName)

                        // Find Group Image
                        const firstGame = items[0]
                        const partnerPrice = data.currentPrices.find((p: any) => p.gameId === firstGame.id)
                        const groupImage = partnerPrice?.imageUrl || firstGame.imageUrl

                        return (
                            <div key={groupName} style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 14px 0px rgba(32, 40, 45, 0.08)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                {/* Group Header */}
                                <div
                                    onClick={() => toggleGroup(groupName)}
                                    style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? '#f8fafc' : 'white', borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        {groupImage ? (
                                            <img src={groupImage} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                        ) : (
                                            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Gamepad2 size={24} color="#94a3b8" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>{groupName}</h3>
                                            <span style={{ fontSize: 12, color: '#64748b' }}>{items.length} Items</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <button
                                            onClick={(e) => handleEditImage(e, groupName, groupImage || '')}
                                            style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}
                                            title="Edit Image"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <div style={{ color: '#94a3b8' }}>
                                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                {isExpanded && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                            <thead>
                                                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>Game Name</th>
                                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>Code</th>
                                                    <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 600 }}>Cost (ต้นทุน)</th>
                                                    <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 600 }}>Selling Price (ราคาขาย)</th>
                                                    <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.sort((a, b) => Number(a.baseCost) - Number(b.baseCost)).map((game) => {
                                                    const price = data.currentPrices.find(p => p.gameId === game.id)
                                                    const myPrice = price ? Number(price.sellPrice) : Math.ceil(Number(game.baseCost) * 1.1)
                                                    const profit = myPrice - Number(game.baseCost)

                                                    return (
                                                        <tr key={game.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '16px 24px', fontWeight: 500, color: '#334155' }}>{game.name}</td>
                                                            <td style={{ padding: '16px 24px', color: '#64748b', fontFamily: 'monospace' }}>{game.code}</td>
                                                            <td style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b' }}>฿{Number(game.baseCost).toLocaleString()}</td>
                                                            <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                                                                ฿{myPrice.toLocaleString()}
                                                                <div style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>
                                                                    +฿{profit.toLocaleString()}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                                <button
                                                                    onClick={() => handleEdit(game)}
                                                                    style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#475569', transition: 'all 0.2s' }}
                                                                >
                                                                    <Edit2 size={14} /> Edit
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Edit Image Modal */}
            <Modal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} title="แก้ไขรูปภาพกลุ่ม (Edit Group Image)">
                {editingGroup && (
                    <form action={onSaveImage} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <input type="hidden" name="company" value={editingGroup.name} />

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                                รูปภาพ (Image URL)
                            </label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <Input
                                    name="imageUrl"
                                    defaultValue={editingGroup.imageUrl}
                                    placeholder="https://example.com/image.png"
                                    style={{ flex: 1 }}
                                />
                                {editingGroup.imageUrl && (
                                    <img src={editingGroup.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                )}
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                                รูปภาพนี้จะถูกใช้กับเกมทั้งหมดในกลุ่ม {editingGroup.name}
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                            <Button type="button" variant="outline" onClick={() => setIsImageModalOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'บันทึกรูปภาพ'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Edit Price Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="แก้ไขราคาขาย (Edit Price)">
                {editingGame && (
                    <form action={onSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <input type="hidden" name="gameId" value={editingGame.id} />
                        <input type="hidden" name="partnerId" value={data.partner.id} />

                        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Game Name</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>{editingGame.name}</div>
                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 8, marginBottom: 4 }}>Base Cost (ต้นทุน)</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>฿{Number(editingGame.baseCost).toLocaleString()}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                                ราคาขาย (Selling Price) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <Input
                                name="sellPrice"
                                type="number"
                                step="0.01"
                                defaultValue={editingGame.currentSellPrice}
                                required
                                style={{ height: 48, fontSize: 16 }}
                            />
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                                ราคาที่ลูกค้าของคุณจะเห็น (ต้องมากกว่าต้นทุน)
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                                รายละเอียด (Description) - Optional
                            </label>
                            <textarea
                                name="description"
                                defaultValue={editingGame.currentDescription}
                                style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'inherit', fontSize: 14 }}
                                placeholder="รายละเอียดสินค้า..."
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'บันทึกการเปลี่ยนแปลง'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

        </div>
    )
}
