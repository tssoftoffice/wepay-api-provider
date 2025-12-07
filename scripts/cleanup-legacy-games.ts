import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning up legacy games...')

    const legacyGames = await prisma.game.findMany({
        where: {
            NOT: [
                { code: { startsWith: 'mtopup_' } },
                { code: { startsWith: 'gtopup_' } },
                { code: { startsWith: 'cashcard_' } }
            ]
        }
    })

    console.log(`Found ${legacyGames.length} legacy games.`)

    if (legacyGames.length > 0) {
        const gameIds = legacyGames.map(g => g.id)

        // Delete PartnerGamePrice
        const deletedPrices = await prisma.partnerGamePrice.deleteMany({
            where: { gameId: { in: gameIds } }
        })
        console.log(`Deleted ${deletedPrices.count} partner prices.`)

        // Delete GameTopupTransaction
        const deletedTxns = await prisma.gameTopupTransaction.deleteMany({
            where: { gameId: { in: gameIds } }
        })
        console.log(`Deleted ${deletedTxns.count} transactions.`)

        // Delete Games
        const deletedGames = await prisma.game.deleteMany({
            where: { id: { in: gameIds } }
        })
        console.log(`Deleted ${deletedGames.count} legacy games.`)
    }
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
