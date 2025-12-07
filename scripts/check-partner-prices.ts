import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Find the "Go Topup" partner (or any partner)
    const partner = await prisma.partner.findFirst({
        include: {
            gamePrices: {
                include: { game: true }
            }
        }
    })

    if (!partner) {
        console.log('No partner found.')
        return
    }

    console.log(`Partner: ${partner.name} (${partner.domain})`)
    console.log(`Total Game Prices: ${partner.gamePrices.length}`)

    const newGames = partner.gamePrices.filter(gp =>
        gp.game.code.startsWith('mtopup_') ||
        gp.game.code.startsWith('gtopup_') ||
        gp.game.code.startsWith('cashcard_')
    )

    console.log(`Prices for NEW games: ${newGames.length}`)

    if (newGames.length > 0) {
        console.log('Sample new game price:')
        console.log(`- ${newGames[0].game.code}: ${newGames[0].sellPrice}`)
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
