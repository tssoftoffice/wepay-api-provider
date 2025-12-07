import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Default Prices...')

    // 1. Get ALL partners
    const partners = await prisma.partner.findMany()

    if (partners.length === 0) {
        console.error('No partners found.')
        return
    }

    // 2. Get all active games
    const games = await prisma.game.findMany({
        where: { status: 'ACTIVE' }
    })

    console.log(`Found ${games.length} games.`)

    for (const partner of partners) {
        console.log(`Setting prices for partner: ${partner.name} (${partner.id})`)
        let count = 0

        // 3. Upsert prices
        for (const game of games) {
            // Calculate default price: Base Cost + 10% margin
            const baseCost = Number(game.baseCost)
            const sellPrice = Math.ceil(baseCost * 1.1) // Round up to nearest integer

            try {
                await prisma.partnerGamePrice.upsert({
                    where: {
                        partnerId_gameId: {
                            partnerId: partner.id,
                            gameId: game.id
                        }
                    },
                    update: {
                        sellPrice: sellPrice
                    },
                    create: {
                        partnerId: partner.id,
                        gameId: game.id,
                        sellPrice: sellPrice
                    }
                })
                count++
            } catch (e: any) {
                console.error(`Failed to set price for ${game.name}: ${e.message}`)
            }
        }
        console.log(`Successfully updated prices for ${count} games for ${partner.name}.`)
    }

    console.log('Finished seeding prices for all partners.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
