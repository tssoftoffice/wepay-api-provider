const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function createPriceAndFixTxn() {
    // 1. Find partner and game
    const partner = await p.partner.findFirst()
    const game = await p.game.findFirst({ where: { code: 'gtopup_FREEFIRE_10' } })

    if (!partner || !game) {
        console.log('Partner or game not found')
        return
    }

    console.log('Partner:', partner.name)
    console.log('Game:', game.name)

    // 2. Create custom price = 11
    const customPrice = await p.partnerGamePrice.upsert({
        where: {
            partnerId_gameId: {
                partnerId: partner.id,
                gameId: game.id
            }
        },
        update: { sellPrice: 11 },
        create: {
            partnerId: partner.id,
            gameId: game.id,
            sellPrice: 11
        }
    })

    console.log('Created/Updated custom price:', customPrice)

    // 3. Fix existing transactions
    const result = await p.gameTopupTransaction.updateMany({
        where: {
            partnerId: partner.id,
            gameId: game.id,
            status: 'SUCCESS'
        },
        data: { sellPrice: 11 }
    })

    console.log('Updated transactions:', result.count)

    await p.$disconnect()
}

createPriceAndFixTxn()
