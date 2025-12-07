'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

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

    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
    const [searchTerm, setSearchTerm] = React.useState('')

    // Group games by category
    const groupedGames = React.useMemo(() => {
        return data.games.reduce((acc: any, game) => {
            let company = 'Other'
            const parts = game.code.split('_')

            if (['mtopup', 'gtopup', 'cashcard'].includes(parts[0]) && parts.length >= 2) {
                company = parts[1]
            } else if (parts.length > 0) {
                company = parts[0]
            }

            if (!acc[company]) acc[company] = []
            acc[company].push(game)
            return acc
        }, {})
    }, [data.games])

    const categories = Object.keys(groupedGames).sort()
    const filteredCategories = categories.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()))

    if (selectedCategory) {
        const games = groupedGames[selectedCategory] || []
        // Get current image from the first game in the group (assuming they share the same image)
        const currentImage = games.length > 0 ? (games[0] as any).imageUrl : null

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <Button variant="secondary" onClick={() => setSelectedCategory(null)} className={styles.backButton}>
                        ← {t.navbar?.cancel || 'Back'}
                    </Button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        {currentImage && (
                            <img
                                src={currentImage}
                                alt={selectedCategory}
                                style={{ width: 50, height: 50, objectFit: 'contain', borderRadius: 8, backgroundColor: '#f1f5f9' }}
                            />
                        )}
                        <h1 className={styles.title} style={{ margin: 0 }}>{selectedCategory}</h1>
                    </div>

                    <form action={updateGameImageAction} className={styles.imageForm} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="hidden" name="company" value={selectedCategory} />
                        <Input
                            name="imageUrl"
                            placeholder="Image URL"
                            defaultValue={currentImage || ''}
                            style={{ width: 250 }}
                        />
                        <Button type="submit">Update Image</Button>
                    </form>
                </div>

                <div className={styles.grid}>
                    {games.sort((a: any, b: any) => Number(a.baseCost) - Number(b.baseCost)).map((game: any) => {
                        const price = data.currentPrices.find(p => p.gameId === game.id)
                        const currentSellPrice = price ? Number(price.sellPrice) : Math.ceil(Number(game.baseCost) * 1.1)

                        return (
                            <Card key={game.id} className={styles.card}>
                                <h3>{game.name}</h3>
                                <p className={styles.cost}>{t.pricing.baseCost}: ฿{Number(game.baseCost).toLocaleString()}</p>

                                <form action={updatePriceAction} className={styles.form}>
                                    <input type="hidden" name="gameId" value={game.id} />
                                    <input type="hidden" name="partnerId" value={data.partner.id} />

                                    <div className={styles.inputGroup}>
                                        <label>{t.pricing.sellingPrice}</label>
                                        <Input
                                            name="sellPrice"
                                            type="number"
                                            step="0.01"
                                            defaultValue={currentSellPrice}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Description (HTML)</label>
                                        <textarea
                                            name="description"
                                            defaultValue={game.description || ''}
                                            style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                        />
                                    </div>

                                    <Button type="submit" className={styles.saveButton}>{t.pricing.savePrice}</Button>
                                </form>
                            </Card>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t.pricing.title}</h1>

            <div className={styles.searchBar}>
                <Input
                    placeholder="Search category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <Card className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Total Items</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map(category => (
                            <tr key={category}>
                                <td>{category}</td>
                                <td>{groupedGames[category].length} items</td>
                                <td>
                                    <Button
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        Manage Prices
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filteredCategories.length === 0 && (
                            <tr>
                                <td colSpan={3} className={styles.emptyState}>No categories found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    )
}
