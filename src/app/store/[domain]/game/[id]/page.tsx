import React from 'react'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import styles from './page.module.css'
import { redirect } from 'next/navigation'
import { GameTopupForm } from './GameTopupForm'

async function getGameData(domain: string, gameId: string) {
    // 1. Find the partner and the specific game requested to identify the Company
    const partner = await prisma.partner.findUnique({
        where: { domain },
        include: {
            gamePrices: {
                where: { gameId },
                include: { game: true }
            }
        }
    })

    if (!partner || partner.gamePrices.length === 0) return null

    const requestedGame = partner.gamePrices[0].game

    // Extract company from code
    let company = 'Other'
    const parts = requestedGame.code.split('_')
    if (['mtopup', 'gtopup', 'cashcard'].includes(parts[0]) && parts.length >= 2) {
        company = parts[1]
    } else if (parts.length > 0) {
        company = parts[0]
    }

    // 2. Fetch ALL games for this partner that match the company
    const allPartnerGames = await prisma.partnerGamePrice.findMany({
        where: {
            partnerId: partner.id,
            game: {
                code: { contains: company } // This is a bit loose, but works if company is unique enough
            }
        },
        include: { game: true },
        orderBy: { sellPrice: 'asc' }
    })

    // Filter strictly in JS to be safe (avoid partial matches like 'CAT' matching 'CATFOOD')
    const companyGames = allPartnerGames.filter(gp => {
        const p = gp.game.code.split('_')
        const c = (['mtopup', 'gtopup', 'cashcard'].includes(p[0]) && p.length >= 2) ? p[1] : p[0]
        return c === company
    })

    return {
        partner: {
            ...partner,
            walletBalance: Number(partner.walletBalance),
            gamePrices: []
        },
        gamePrices: companyGames.map(gp => ({
            id: gp.id,
            name: gp.game.name,
            price: Number(gp.sellPrice),
            sellPrice: Number(gp.sellPrice),
            game: {
                ...gp.game,
                baseCost: Number(gp.game.baseCost)
            },
            description: (gp.game as any).description // Pass description
        })),
        game: {
            ...requestedGame,
            name: requestedGame.name.split(' ')[0], // Use company name for the header
            baseCost: Number(requestedGame.baseCost),
            servers: (requestedGame as any).servers ? JSON.parse((requestedGame as any).servers) : null,
            imageUrl: partner.gamePrices[0].imageUrl || (requestedGame as any).imageUrl // Prefer Partner Image
        }
    }
}

export default async function GameDetailPage({ params }: { params: Promise<{ domain: string, id: string }> }) {
    const { domain, id } = await params
    const data = await getGameData(domain, id)

    if (!data) {
        redirect(`/store/${domain}`)
    }

    const { partner, gamePrices, game } = data

    return (
        <div className={styles.container}>
            {/* Left Column: Game Image */}
            <div className={styles.imageColumn}>
                <div className={styles.imageWrapper}>
                    {(game as any).imageUrl ? (
                        <img
                            src={(game as any).imageUrl}
                            alt={game.name}
                            className={styles.gameImage}
                            style={{ width: '100%', borderRadius: '1rem' }}
                        />
                    ) : (
                        <div className={styles.gameImagePlaceholder}>
                            {game.name}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Topup Form */}
            <div className={styles.formColumn}>
                <GameTopupForm
                    gameId={game.id}
                    gameName={game.name}
                    gamePrices={gamePrices}
                    domain={domain}
                    servers={(game as any).servers}
                />
            </div>
        </div>
    )
}
