const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function fixSellPrice() {
    // Get the transaction that has sellPrice = 9.625 (Free Fire 10 THB)
    const txn = await p.gameTopupTransaction.findFirst({
        where: { status: 'SUCCESS', sellPrice: 9.625 }
    })

    if (!txn) {
        console.log('No transaction found to fix')
        return
    }

    // Check if partner has custom price
    const customPrice = await p.partnerGamePrice.findUnique({
        where: {
            partnerId_gameId: {
                partnerId: txn.partnerId,
                gameId: txn.gameId
            }
        }
    })

    console.log('Transaction:', txn)
    console.log('Custom Price:', customPrice)

    if (customPrice) {
        await p.gameTopupTransaction.update({
            where: { id: txn.id },
            data: { sellPrice: customPrice.sellPrice }
        })
        console.log('Updated sellPrice to:', customPrice.sellPrice)
    }

    await p.$disconnect()
}

fixSellPrice()
