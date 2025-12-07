const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function checkAndFix() {
    // 1. Check if partner has any custom prices
    const customPrices = await p.partnerGamePrice.findMany({
        include: { partner: true, game: true }
    })
    console.log('Custom Prices:', customPrices.map(cp => ({
        partner: cp.partner.name,
        game: cp.game.name,
        sellPrice: Number(cp.sellPrice)
    })))

    // 2. Get all SUCCESS transactions
    const txns = await p.gameTopupTransaction.findMany({
        where: { status: 'SUCCESS' },
        include: { partner: true, game: true }
    })

    console.log('\nTransactions before fix:')
    for (const txn of txns) {
        console.log(`- ${txn.game.name}: baseCost=${txn.baseCost}, sellPrice=${txn.sellPrice}`)

        // Find custom price for this partner+game
        const cp = customPrices.find(c => c.partnerId === txn.partnerId && c.gameId === txn.gameId)
        if (cp && Number(txn.sellPrice) !== Number(cp.sellPrice)) {
            console.log(`  -> Fixing: ${txn.sellPrice} -> ${cp.sellPrice}`)
            await p.gameTopupTransaction.update({
                where: { id: txn.id },
                data: { sellPrice: cp.sellPrice }
            })
        }
    }

    console.log('\nDone!')
    await p.$disconnect()
}

checkAndFix()
