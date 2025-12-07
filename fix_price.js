
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Fixing transaction price...')

    // Find the last game topup transaction
    const lastTxn = await prisma.gameTopupTransaction.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (!lastTxn) {
        console.log('No transaction found.')
        return
    }

    console.log('Found transaction:', lastTxn)

    if (Number(lastTxn.sellPrice) === 10 && Number(lastTxn.baseCost) === 10) {
        // Update sell price to 11
        const updated = await prisma.gameTopupTransaction.update({
            where: { id: lastTxn.id },
            data: { sellPrice: 11 }
        })
        console.log('Updated transaction to Sell Price: 11', updated)
    } else {
        console.log('Transaction does not match expected criteria (Cost 10, Sell 10). Skipping.')
    }
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
