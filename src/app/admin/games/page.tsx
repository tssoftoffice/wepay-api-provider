'use client'

import { useState, useEffect, useTransition } from 'react'
import { getGames, updateGame, syncGames, updateGroupImage } from './actions'
import { RefreshCw, Search, Edit2, Gamepad2, Save, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function AdminGamesPage() {
    const [games, setGames] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('ALL') // ALL, GAME, CARD, MOBILE, BILL
    const [isPending, startTransition] = useTransition()
    const [expandedGroups, setExpandedGroups] = useState<string[]>([])

    // Group Editing State
    const [editingGroup, setEditingGroup] = useState<{ name: string, ids: string[], imageUrl: string } | null>(null)
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)

    // Helper to determine category
    const getCategory = (game: any) => {
        const code = (game.code || '').toLowerCase()
        const name = (game.name || '').toLowerCase()

        if (code.includes('mtopup')) return 'MOBILE'
        if (code.includes('bill')) return 'BILL'
        if (code.includes('card') || name.includes('card') || name.includes('บัตร') || name.includes('voucher') || code.includes('pin')) return 'CARD'

        // Fallback for known patterns
        if (name.includes('ais') || name.includes('dtac') || name.includes('true')) return 'MOBILE'

        return 'GAME'
    }

    // Filtered games based on search and category
    const filteredGames = games.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.code.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === 'ALL' || getCategory(g) === category
        return matchesSearch && matchesCategory
    })

    // Grouping computation
    const groupedGames = filteredGames.reduce((acc: any, game: any) => {
        // Improve grouping: Use code prefix if available, otherwise name
        let groupName = 'Others'

        if (game.code.includes('_')) {
            // e.g. mtopup_HAPPY-AOP_85 -> mtopup_HAPPY-AOP
            const parts = game.code.split('_')
            if (parts.length > 2) {
                groupName = parts.slice(0, parts.length - 1).join('_')
            } else {
                groupName = parts[0]
            }
        } else {
            groupName = game.name.split(/\s\d/)[0].trim()
        }

        if (!acc[groupName]) acc[groupName] = []
        acc[groupName].push(game)
        return acc
    }, {})

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        )
    }

    // Modal State
    const [editingGame, setEditingGame] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchGames = async () => {
        setLoading(true)
        const res = await getGames(search)
        if (res.success) {
            setGames(res.data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchGames()
    }, [])

    const handleSync = () => {
        startTransition(async () => {
            const res = await syncGames()
            if (res.success) {
                alert(`Sync สำเร็จ! เพิ่มเกมใหม่ ${res.count} เกม`)
                fetchGames()
            } else {
                alert('เกิดข้อผิดพลาดในการ Sync: ' + res.error)
            }
        })
    }

    const handleEdit = (game: any) => {
        setEditingGame({ ...game })
        setIsModalOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingGame) return

        const res = await updateGame(editingGame.id, {
            status: editingGame.status,
            baseCost: parseFloat(editingGame.baseCost),
            imageUrl: editingGame.imageUrl
        })

        if (res.success) {
            setIsModalOpen(false)
            fetchGames()
        } else {
            alert('Failed to update: ' + res.error)
        }
    }

    const handleEditGroup = (e: React.MouseEvent, groupName: string, items: any[]) => {
        e.stopPropagation() // Prevent accordion toggle
        // Find current image from first item
        const currentImage = items.find(i => i.imageUrl)?.imageUrl || ''
        const ids = items.map(i => i.id)
        setEditingGroup({ name: groupName, ids, imageUrl: currentImage })
        setIsGroupModalOpen(true)
    }

    const handleSaveGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingGroup) return

        const res = await updateGroupImage(editingGroup.ids, editingGroup.imageUrl)

        if (res.success) {
            setIsGroupModalOpen(false)
            setEditingGroup(null)
            fetchGames()
            alert('อัพเดทรูปภาพกลุ่มเรียบร้อยแล้ว')
        } else {
            alert('Failed to update group: ' + res.error)
        }
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Game Management</h1>
                    <p style={{ color: '#64748b' }}>Manage games, prices, and status</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleSync}
                        disabled={isPending}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: isPending ? '#94a3b8' : '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={18} className={isPending ? 'spin' : ''} />
                        {isPending ? 'Syncing...' : 'Sync Games'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search games..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchGames()}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                    />
                </div>

                {/* Categories */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['ALL', 'GAME', 'CARD', 'MOBILE', 'BILL'].map(c => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: category === c ? '#2563eb' : '#f1f5f9',
                                color: category === c ? 'white' : '#64748b',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {c === 'ALL' ? 'ทั้งหมด' : c === 'GAME' ? 'เกม' : c === 'CARD' ? 'บัตรเติมเงิน' : c === 'MOBILE' ? 'เติมมือถือ' : 'จ่ายบิล'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Object.keys(groupedGames).length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '16px' }}>ไม่พบข้อมูลเกม</div>
                    ) : (
                        (Object.entries(groupedGames) as [string, any[]][]).map(([groupKey, groupItems]) => {
                            // Derive a nice display name from the first item
                            let displayName = groupItems[0].name
                            if (groupItems.length > 1) {
                                displayName = displayName.replace(/\s?\d+(\s?(THB|Baht|Bath|Credit|UC|Diamond|Gem|Gold|Coin))?.*/i, '').trim()
                                if (!displayName || displayName.length < 2) displayName = groupItems[0].name
                            }

                            // Find the first item that has an image to use as the group icon
                            const groupImage = groupItems.find((item: any) => item.imageUrl)?.imageUrl

                            return (
                                <div key={groupKey} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                    <div
                                        style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={() => toggleGroup(groupKey)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Show Image if available */}
                                            {groupImage ? (
                                                <img src={groupImage} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Gamepad2 size={24} color="#94a3b8" />
                                                </div>
                                            )}
                                            <div>
                                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', display: 'block' }}>{displayName}</span>
                                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Code: {groupKey}</span>
                                            </div>
                                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#e2e8f0', color: '#64748b' }}>
                                                {groupItems.length} รายการ
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button
                                                onClick={(e) => handleEditGroup(e, displayName, groupItems)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    color: '#64748b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                title="Edit Group Image"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <span style={{ transform: expandedGroups.includes(groupKey) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#94a3b8' }}>▼</span>
                                        </div>
                                    </div>

                                    {expandedGroups.includes(groupKey) && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>ITEM</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>DESC</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>CODE</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#64748b' }}>PRICE (FACE)</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#64748b' }}>COST</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>STATUS</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupItems.map((game: any) => (
                                                    <tr key={game.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <span style={{ fontSize: '14px', color: '#334155' }}>{game.name}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{game.description}</td>
                                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{game.code}</td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>{game.faceValue}</td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>฿{game.baseCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <span style={{
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                background: game.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                                                                color: game.status === 'ACTIVE' ? '#166534' : '#64748b'
                                                            }}>
                                                                {game.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => handleEdit(game)}
                                                                style={{ padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#475569' }}
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {/* Edit Group Modal */}
            <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title="แก้ไขกลุ่มเกม (Edit Group)">
                {editingGroup && (
                    <form onSubmit={handleSaveGroup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Group Name</label>
                            <Input value={editingGroup.name} disabled style={{ background: '#f8fafc' }} />
                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Updating image for {editingGroup.ids.length} items in this group.</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>รูปภาพกลุ่ม (Group Image URL)</label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <Input
                                    value={editingGroup.imageUrl || ''}
                                    onChange={(e: any) => setEditingGroup({ ...editingGroup, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.png"
                                    style={{ flex: 1 }}
                                />
                                {editingGroup.imageUrl && (
                                    <img src={editingGroup.imageUrl} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                            <Button type="button" variant="outline" onClick={() => setIsGroupModalOpen(false)}>ยกเลิก</Button>
                            <Button type="submit">บันทึกรูปภาพ</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Edit Game Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="แก้ไขข้อมูลเกม">
                {editingGame && (
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Code</label>
                                <Input value={editingGame.code} disabled style={{ background: '#f8fafc' }} />
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Name</label>
                                <Input value={editingGame.name} disabled style={{ background: '#f8fafc' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Provider Price</label>
                                <Input value={editingGame.providerPrice} disabled style={{ background: '#f8fafc' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Base Cost (ต้นทุนที่ขาย Partner)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingGame.baseCost}
                                    onChange={(e: any) => setEditingGame({ ...editingGame, baseCost: e.target.value })}
                                    required
                                />
                            </div>
                        </div>



                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>สถานะ</label>
                            <select
                                value={editingGame.status}
                                onChange={(e) => setEditingGame({ ...editingGame, status: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                            >
                                <option value="ACTIVE">ACTIVE (เปิดขาย)</option>
                                <option value="INACTIVE">INACTIVE (ปิด)</option>
                                <option value="MAINTENANCE">MAINTENANCE (ปิดปรับปรุง)</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                            <Button type="submit">บันทึก</Button>
                        </div>
                    </form>
                )}
            </Modal>

            <style jsx global>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    )
}
