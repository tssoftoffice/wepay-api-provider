'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { WePayClient } from '@/lib/wepay'
import { getPricingRate } from '@/config/pricing'

// Get all games with search support
export async function getGames(search?: string) {
    try {
        const where: any = {}
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ]
        }

        const games = await prisma.game.findMany({
            where,
            orderBy: { status: 'asc' } // Active first
        })

        // Serialize decimals
        const serializedGames = games.map(g => ({
            ...g,
            faceValue: g.faceValue.toNumber(),
            providerPrice: g.providerPrice.toNumber(),
            baseCost: g.baseCost.toNumber(),
        }))

        return { success: true, data: serializedGames }
    } catch (error) {
        console.error('Error fetching games:', error)
        return { success: false, error: 'Failed to fetch games' }
    }
}

// Update game details
export async function updateGame(id: string, data: { status: string, baseCost: number, imageUrl?: string }) {
    try {
        await prisma.game.update({
            where: { id },
            data: {
                status: data.status,
                baseCost: data.baseCost,
                imageUrl: data.imageUrl
            }
        })
        revalidatePath('/admin/games')
        return { success: true }
    } catch (error) {
        console.error('Error updating game:', error)
        return { success: false, error: 'Failed to update game' }
    }
}

// Sync games from WePay API
export async function syncGames() {
    try {
        console.log('Starting syncGames...')
        const data = await WePayClient.getAvailableProducts()

        if (!data || !data.data) {
            throw new Error('Invalid data received from WePay')
        }

        console.log('Fetched data from WePay')

        // Fetch all existing games code to a Set for O(1) lookup
        const existingGames = await prisma.game.findMany({
            select: { code: true, providerPrice: true, baseCost: true, faceValue: true }
        })
        const existingMap = new Map(existingGames.map(g => [g.code, g]))

        const categories = [
            { type: 'mtopup', items: data.data.mtopup },
            { type: 'gtopup', items: data.data.gtopup },
            { type: 'cashcard', items: data.data.cashcard }
        ]

        const toCreate: any[] = []
        const toUpdate: any[] = []

        let totalItems = 0

        for (const category of categories) {
            if (!category.items) continue

            for (const company of category.items) {
                const companyId = company.company_id
                const companyName = company.company_name

                for (const denom of company.denomination) {
                    totalItems++
                    const price = parseFloat(denom.price)
                    const code = `${category.type}_${companyId}_${price}`
                    const name = `${companyName} ${price} THB`

                    let description = denom.description
                    if (!description) {
                        description = `<p><strong>${name}</strong></p><ul><li>Product Code: ${companyId}</li></ul>`
                    }

                    // Logic: Dynamic Pricing from Config (Detailed Rates) (Step 2)
                    // Get correct ratios for this specific game/category
                    const { costRatio, priceRatio } = getPricingRate(category.type, code)

                    const providerPrice = Number((price * costRatio).toFixed(4))
                    const baseCost = Number((price * priceRatio).toFixed(4))

                    const existing = existingMap.get(code)

                    if (existing) {
                        toUpdate.push({
                            code,
                            description,
                            providerPrice: providerPrice, // Always update to latest API calculation
                            // baseCost was here
                            baseCost: baseCost,
                            faceValue: price // Always ensure faceValue is correct
                        })
                    } else {
                        toCreate.push({
                            name,
                            code,
                            faceValue: price,
                            providerPrice,
                            baseCost,
                            status: 'ACTIVE',
                            imageUrl: '/games/default.png',
                            description
                        })
                    }
                }
            }
        }

        console.log(`Processing ${totalItems} items: ${toCreate.length} new, ${toUpdate.length} updates`)

        // Batch Create
        if (toCreate.length > 0) {
            await prisma.game.createMany({
                data: toCreate,
                skipDuplicates: true
            })
        }

        // Sequential Update (Slow but Safe)
        // Processing one by one to avoid any connection pool limits
        let p = 0
        for (const item of toUpdate) {
            p++
            try {
                const updateData: any = {
                    description: item.description,
                    providerPrice: item.providerPrice,
                    faceValue: item.faceValue
                }
                // Only include baseCost in update if it's defined (we might have chosen not to update it in some logic, but here we passed it)
                if (item.baseCost !== undefined) {
                    updateData.baseCost = item.baseCost
                }

                await prisma.game.update({
                    where: { code: item.code },
                    data: updateData
                })
            } catch (err) {
                console.error(`Failed to update ${item.code}`, err)
                // Continue to next item
            }
        }

        // Create Notification (Disabled due to Prisma Client lock)
        // if (toCreate.length > 0 || toUpdate.length > 0) {
        //     await prisma.notification.create({
        //         data: {
        //             title: 'Game Sync Complete',
        //             message: `Sync สำเร็จ: เพิ่ม ${toCreate.length} เกม, อัปเดต ${toUpdate.length} เกม (จากทั้งหมด ${totalItems})`,
        //             type: 'SUCCESS'
        //         }
        //     })
        // }

        revalidatePath('/admin/games')
        return { success: true, count: toCreate.length + toUpdate.length }
    } catch (error: any) {
        console.error('Error syncing games:', error)
        return { success: false, error: 'Failed to sync games: ' + error.message }
    }
}

// Update image for a group of games
export async function updateGroupImage(gameIds: string[], imageUrl: string) {
    try {
        await prisma.game.updateMany({
            where: {
                id: { in: gameIds }
            },
            data: {
                imageUrl
            }
        })
        revalidatePath('/admin/games')
        return { success: true }
    } catch (error) {
        console.error('Failed to update group image:', error)
        return { success: false, error: 'Failed to update group image' }
    }
}
