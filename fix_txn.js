const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function fix() {
    // Get all transactions
    const txns = await p.gameTopupTransaction.findMany({
        where: { status: 'SUCCESS' },
        include: { game: true }
    })

    console.log('Transactions:')
    for (const txn of txns) {
        console.log(`- Game: ${txn.game.name}, sellPrice: ${txn.sellPrice}, baseCost: ${txn.baseCost}`)

        // Update sellPrice to 11 for Free Fire 10 THB
        if (txn.game.code === 'gtopup_FREEFIRE_10') {
            await p.gameTopupTransaction.update({
                where: { id: txn.id },
                data: { sellPrice: 11 }
            })
            console.log('  -> Updated to 11')
        }
    }

    await p.$disconnect()
}

fix()
