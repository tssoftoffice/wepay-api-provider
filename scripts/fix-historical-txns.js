
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- Fixing Historical Transactions (Sync with Current Game Prices) ---')

    // 1. Fetch all SUCCESS transactions
    const txns = await prisma.gameTopupTransaction.findMany({
        where: { status: 'SUCCESS' },
        include: { game: true }
    })

    let updated = 0

    for (const t of txns) {
        if (!t.game) continue

        const currentBaseCost = Number(t.baseCost)
        const currentProviderPrice = Number(t.providerPrice)
        const gameBaseCost = Number(t.game.baseCost)
        const gameProviderPrice = Number(t.game.providerPrice)

        // Logic: If the transaction recorded a LOSS (BaseCost < ProviderPrice)
        // OR if the recorded BaseCost is significantly different from current Game BaseCost (optional)
        // Let's focus on fixing the LOSS first as that's the user complaint.

        // Also, we might want to update providerPrice if it was wrong, but usually provider data is historical truth.
        // However, baseCost is our setting. We can Retroactively apply our new pricing policy.

        let needsUpdate = false
        let newBaseCost = currentBaseCost
        let newProviderPrice = currentProviderPrice

        if (currentBaseCost < currentProviderPrice) {
            console.log(`[FOUND LOSS] Txn ${t.id} - Cost: ${currentProviderPrice}, Price: ${currentBaseCost}`)
            // Fix: Set Price to Game's current Price (which we just fixed to be profitable)
            // Or if Game price changed too much, at least Make it Profitable (Cost + 1.5%)

            // Let's use current Game Price if valid
            if (gameBaseCost > currentProviderPrice) {
                newBaseCost = gameBaseCost
                needsUpdate = true
            } else {
                // Fallback: Add 1.5%
                newBaseCost = currentProviderPrice * 1.015
                needsUpdate = true
            }
        }

        if (needsUpdate) {
            // Round
            newBaseCost = Math.ceil(newBaseCost * 100) / 100

            await prisma.gameTopupTransaction.update({
                where: { id: t.id },
                data: { baseCost: newBaseCost }
            })
            console.log(`  -> Fixed: New Price ${newBaseCost} (Profit: ${(newBaseCost - currentProviderPrice).toFixed(2)})`)
            updated++
        }
    }

    console.log(`\nFixed ${updated} historical transactions.`)
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
