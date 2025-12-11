
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- Updating Game Margins (BaseCost = ProviderPrice + 1.5%) ---')

    // 1. Fetch all active games
    const games = await prisma.game.findMany({
        where: { status: 'ACTIVE' }
    })

    let count = 0
    let updated = 0

    for (const g of games) {
        // providerPrice = Cost from WePay
        // baseCost = Price we sell to Partner

        const providerPrice = Number(g.providerPrice)
        const currentBaseCost = Number(g.baseCost)
        const faceValue = Number(g.faceValue) || 0

        // Target: Partner Price should be at least WePay Cost + 1.5%
        // Or if user said "Add 1-2% for our web", let's typically use 1.5%.
        const targetMargin = 0.015 // 1.5%
        const minBaseCost = providerPrice * (1 + targetMargin)

        // Check if we need to update
        // We update if current BaseCost is LESS than our target MinBaseCost
        // (i.e. we are getting less than 1.5% profit)
        // OR if baseCost == providerPrice (0 profit)

        if (currentBaseCost < minBaseCost) {
            // New Price
            let newBaseCost = minBaseCost

            // Safety: Don't exceed Face Value?
            // If FaceValue > 0 and newBaseCost > FaceValue, we have a problem.
            // Usually we shouldn't sell higher than face value unless necessary.
            // But user said "Add 1-2% for our web".
            // If WePay gives 0 discount (providerPrice = faceValue), then baseCost MUST be > faceValue to make profit.
            // So we allow it.

            // Round to 2 decimals
            newBaseCost = Math.ceil(newBaseCost * 100) / 100

            await prisma.game.update({
                where: { id: g.id },
                data: { baseCost: newBaseCost }
            })

            console.log(`[UPDATE] ${g.name}: Prov ${providerPrice} -> Base ${currentBaseCost} => New Base ${newBaseCost}`)
            updated++
        }
        count++
    }

    console.log(`\nProcessed ${count} games. Updated ${updated} pricing.`)
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
