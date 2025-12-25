
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const partnerId = '586e9aeb-7957-45bf-9080-32df9d36087d'

    // 1. Find the target transaction
    // Debug: List recent transactions
    console.log('Listing recent SUCCESS transactions...')
    const recent = await prisma.gameTopupTransaction.findMany({
        where: { status: 'SUCCESS' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { game: true, partner: true }
    })

    console.log('Found recent:', recent.map(t => ({
        id: t.id,
        partner: t.partner?.name,
        partnerId: t.partnerId,
        game: t.game?.name,
        sellPrice: t.sellPrice,
        baseCost: t.baseCost,
        createdAt: t.createdAt
    })))

    // Target: Free Fire 10 THB, Sell Price 9.625 (Should be 11.00)
    const target = await prisma.gameTopupTransaction.findFirst({
        where: {
            // partnerId: partnerId, // Optional, can filter by partner to be safe if needed
            sellPrice: 9.625,
            status: 'SUCCESS',
            game: {
                name: { contains: 'Free Fire 10 THB' }
            }
        },
        include: { partner: true }
    })

    if (target) {
        console.log('\n--- TARGET FOUND ---')
        console.log(`ID: ${target.id}`)
        console.log(`Game: ${target.game?.name}`)
        console.log(`Current Price: ${target.sellPrice}`)
        console.log(`Base Cost: ${target.baseCost}`)

        // Correction
        const NEW_SELL_PRICE = 11.00
        const CURRENT_PRICE = Number(target.sellPrice)
        const DIFF = NEW_SELL_PRICE - CURRENT_PRICE // 11.00 - 9.625 = 1.375 (Positive means user UNDERPAID, so we DEDUCT)

        console.log(`\n--- APPLYING PATCH ---`)
        console.log(`New Price: ${NEW_SELL_PRICE}`)
        console.log(`Difference: ${DIFF} (Amount partner needs to pay more)`)

        // DEDUCT from wallet because price increased
        await prisma.$transaction([
            prisma.gameTopupTransaction.update({
                where: { id: target.id },
                data: { sellPrice: NEW_SELL_PRICE }
            }),
            prisma.partner.update({
                where: { id: target.partnerId },
                data: { walletBalance: { decrement: DIFF } } // Decrement for underpayment
            })
        ])
        console.log(`✅ Patch Applied! Deducted ${DIFF} THB from partner wallet.`)
    } else {
        console.log('No target found for Free Fire fix.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
