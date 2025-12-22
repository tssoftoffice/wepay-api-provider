import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateApiKey } from '@/lib/api-auth'
import { calculateDefaultPartnerSellPrice } from '@/config/pricing'

export async function GET(req: NextRequest) {
    const auth = await validateApiKey(req)

    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { partner } = auth

    // Fetch all active games (filtered for gtopup only as requested)
    const games = await prisma.game.findMany({
        where: {
            status: 'ACTIVE',
            code: {
                startsWith: 'gtopup',
                mode: 'insensitive'
            }
        }
    })

    // Fetch partner's custom prices
    const partnerPrices = await prisma.partnerGamePrice.findMany({
        where: { partnerId: partner!.id }
    })

    // Map games to items first
    const items = games.map(game => {
        const customPrice = partnerPrices.find(p => p.gameId === game.id)

        // RRP (Recommended Retail Price) - What they should sell for
        let price = customPrice
            ? Number(customPrice.sellPrice)
            : calculateDefaultPartnerSellPrice(Number(game.baseCost))

        // Convert baseCost to Number
        const costPrice = Number(game.baseCost)

        // Parse servers JSON if available
        let serverList = null
        if (game.servers) {
            try {
                serverList = JSON.parse(game.servers as string)
            } catch (e) {
                // Ignore parse error
            }
        }

        return {
            id: game.id,
            code: game.code,
            name: game.name,
            description: game.description,
            price: price, // RRP
            cost_price: customPrice ? Number(customPrice.sellPrice) : costPrice, // Use their price as cost if set
            image_url: customPrice?.imageUrl || game.imageUrl, // Prefer Partner Image
            example_id_url: customPrice?.exampleIdUrl || game.exampleIdUrl, // Prefer Partner Image
            servers: serverList
        }
    })

    // Grouping Logic - Level 1: By Game Group (e.g. DUNKCITY)
    const groupedGames: Record<string, any> = {}

    items.forEach(item => {
        const parts = item.code.split('_')

        let prefix = 'other'
        let groupKey = 'OTHER'

        if (parts.length >= 2) {
            // e.g. gtopup_FREEFIRE_10
            prefix = parts[0]
            groupKey = parts[1]
        } else if (parts.length === 1) {
            groupKey = parts[0]
        }


        if (!groupedGames[groupKey]) {
            // Extract clean game name (remove price and currency)
            // e.g. "Arena Breakout 189 THB" -> "Arena Breakout"
            const gameName = item.name.replace(/\s+[0-9,.]+(\.\d+)?\s*(THB|Bath|บาท)$/i, '').trim()

            groupedGames[groupKey] = {
                group: groupKey,
                gameName: gameName, // Added as requested
                image: item.image_url,
                example_id_url: item.example_id_url,
                type: prefix, // Temp field for sorting
                items: []
            }
        }

        groupedGames[groupKey].items.push(item)
    })

    // Grouping Logic - Level 2: By Type (gtopup, mtopup, etc.)
    const groupedByType: Record<string, any[]> = {}

    Object.values(groupedGames).forEach((gameGroup: any) => {
        const type = gameGroup.type || 'other'

        if (!groupedByType[type]) {
            groupedByType[type] = []
        }

        // Clean up temp field
        const { type: _, ...cleanGroup } = gameGroup

        groupedByType[type].push(cleanGroup)
    })

    return NextResponse.json({
        data: groupedByType
    })
}
