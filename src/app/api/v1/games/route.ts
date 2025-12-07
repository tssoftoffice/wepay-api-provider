import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateApiKey } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
    const auth = await validateApiKey(req)

    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { partner } = auth

    // Fetch all active games
    const games = await prisma.game.findMany({
        where: { status: 'ACTIVE' }
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
            : Math.ceil(Number(game.baseCost) * 1.1)

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
            cost_price: costPrice, // Capital/Partner Cost
            image_url: game.imageUrl,
            servers: serverList
        }
    })

    // Grouping Logic
    const grouped: Record<string, any> = {}

    items.forEach(item => {
        const parts = item.code.split('_')
        // Default group if parsing fails
        let groupKey = 'OTHER'
        let groupName = 'Other Games'

        if (parts.length >= 2) {
            // e.g. gtopup_FREEFIRE_10 -> FREEFIRE
            // e.g. mtopup_TRMV_100 -> TRMV
            groupKey = parts[1]
            groupName = parts[1]
        }

        if (!grouped[groupKey]) {
            grouped[groupKey] = {
                group: groupKey,
                image: item.image_url, // Use first item's image as group image
                items: []
            }
        }

        grouped[groupKey].items.push(item)
    })

    // Convert map to array
    const data = Object.values(grouped)

    return NextResponse.json({
        data: data
    })
}
