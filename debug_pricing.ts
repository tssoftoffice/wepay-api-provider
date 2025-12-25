
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const partnerIdPrefix = '586e9aeb'
    const gameCode = 'gtopup_ROV-M_10'

    const partner = await prisma.partner.findFirst({
        where: { id: { startsWith: partnerIdPrefix } }
    })

    if (!partner) {
        console.log('Partner not found')
        return
    }

    const game = await prisma.game.findUnique({
        where: { code: gameCode }
    })

    if (!game) {
        console.log('Game not found:', gameCode)
        return
    }

    console.log('Partner:', partner.id)
    console.log('Game:', game.name, game.id, game.code)
    console.log('Game Base Cost:', game.baseCost)

    const priceConfig = await prisma.partnerGamePrice.findUnique({
        where: {
            partnerId_gameId: {
                partnerId: partner.id,
                gameId: game.id
            }
        }
    })

    console.log('--- Price Config ---')
    if (priceConfig) {
        console.log(priceConfig)
    } else {
        console.log('No custom price config found.')
    }

    // Check all prices for this partner to see if there's any close match
    const allPrices = await prisma.partnerGamePrice.findMany({
        where: { partnerId: partner.id },
        include: { game: true }
    })

    console.log(`Total Configured Prices: ${allPrices.length}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
