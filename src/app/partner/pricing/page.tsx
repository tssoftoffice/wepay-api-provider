import React from 'react'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './page.module.css'
import { revalidatePath } from 'next/cache'
import { PricingContent } from './PricingContent'

async function getPricingData() {
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') return null

    const userId = (session as any).userId
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { partner: true }
    })

    if (!user?.partner) return null

    const games = await prisma.game.findMany({
        where: { status: 'ACTIVE' },
        select: {
            id: true,
            name: true,
            code: true,
            faceValue: true,
            providerPrice: true,
            baseCost: true,
            status: true,
            imageUrl: true,
            exampleIdUrl: true,
            group: true,
            servers: true, // Needed for topup, maybe not here?
            // description: false // Excluded
        }
    })

    const currentPrices = await prisma.partnerGamePrice.findMany({
        where: { partnerId: user.partner.id }
    })

    return {
        partner: {
            ...user.partner,
            walletBalance: Number(user.partner.walletBalance)
        },
        games: games.map(g => ({
            ...g,
            faceValue: Number(g.faceValue),
            providerPrice: Number(g.providerPrice),
            baseCost: Number(g.baseCost)
        })),
        currentPrices: currentPrices.map(p => ({
            ...p,
            sellPrice: Number(p.sellPrice)
        }))
    }
}

async function updatePrice(formData: FormData) {
    'use server'
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') return

    const gameId = formData.get('gameId') as string
    const sellPrice = parseFloat(formData.get('sellPrice') as string)
    const partnerId = formData.get('partnerId') as string

    if (!gameId || isNaN(sellPrice)) return

    const description = formData.get('description') as string

    if (description !== null) {
        await prisma.game.update({
            where: { id: gameId },
            // @ts-ignore
            data: { description }
        })
    }

    // Upsert price
    // Prisma upsert needs a unique where clause. 
    // Our schema has @@unique([partnerId, gameId]) but Prisma client generates a compound unique input.

    // Check if exists first for simplicity or use upsert with compound key
    const existing = await prisma.partnerGamePrice.findUnique({
        where: {
            partnerId_gameId: { partnerId, gameId }
        }
    })

    if (existing) {
        await prisma.partnerGamePrice.update({
            where: { id: existing.id },
            data: { sellPrice }
        })
    } else {
        await prisma.partnerGamePrice.create({
            data: {
                partnerId,
                gameId,
                sellPrice
            }
        })
    }

    revalidatePath('/partner/pricing')
}

async function updateGameImage(formData: FormData) {
    'use server'
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') return

    const company = formData.get('company') as string
    const imageUrl = formData.get('imageUrl') as string
    const exampleIdUrl = formData.get('exampleIdUrl') as string

    if (!company || (!imageUrl && !exampleIdUrl)) return

    // Verify user partner again just in case
    const userId = (session as any).userId
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { partner: true } })
    if (!user?.partner) return

    const games = await prisma.game.findMany({
        where: { code: { contains: `_${company}_` } }
    })

    for (const game of games) {
        await prisma.partnerGamePrice.upsert({
            where: {
                partnerId_gameId: {
                    partnerId: user.partner.id,
                    gameId: game.id
                }
            },
            update: { imageUrl, exampleIdUrl },
            create: {
                partnerId: user.partner.id,
                gameId: game.id,
                imageUrl,
                exampleIdUrl,
                sellPrice: game.providerPrice // Default to provider price if creating new entry
            }
        })
    }

    // Also try to match exact company name if it was legacy (though we deleted legacy)
    // or if the code format is strictly TYPE_COMPANY_PRICE

    revalidatePath('/partner/pricing')
    revalidatePath('/partner/pricing')
    revalidatePath('/store') // Revalidate store pages too
}

async function getGameDetails(gameId: string) {
    'use server'
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') return ''

    const game = await prisma.game.findUnique({
        where: { id: gameId },
        select: { description: true }
    })
    return game?.description || ''
}

export default async function PartnerPricingPage() {
    const data = await getPricingData()

    if (!data) return <div>Unauthorized</div>

    return <PricingContent
        data={data as any}
        updatePriceAction={updatePrice}
        updateGameImageAction={updateGameImage}
        getGameDetailsAction={getGameDetails}
    />
}
