const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function check() {
    const txns = await p.gameTopupTransaction.findMany({
        where: { status: 'SUCCESS' },
        include: { game: true }
    })

    console.log('=== All SUCCESS Transactions ===')
    txns.forEach(txn => {
        const sellPrice = Number(txn.sellPrice)
        const baseCost = Number(txn.baseCost)
        const profit = sellPrice - baseCost

        console.log(`
Game: ${txn.game.name}
sellPrice: ${sellPrice}
baseCost: ${baseCost}
providerPrice: ${txn.providerPrice}
Profit (sellPrice - baseCost): ${profit}
Date: ${txn.createdAt}
        `)
    })

    await p.$disconnect()
}

check()
