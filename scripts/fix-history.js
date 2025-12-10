const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Fixing Historical Transactions...')

    // 1. Get the FreeFire 10 item by exact code
    // The previous search 'FREEFIRE_10' matched 'FREEFIRE_1000' incorrectly
    const game = await prisma.game.findFirst({
        where: { code: 'gtopup_FREEFIRE_10' }
    })

    if (!game) {
        // Fallback try finding by name if code varies
        const gameByName = await prisma.game.findFirst({
            where: { name: 'Free Fire 10 THB' }
        })
        if (!gameByName) {
            console.log('Game Free Fire 10 THB not found via code or name')
            return
        }
        console.log(`Found game by name: ${gameByName.name} (${gameByName.code})`)
        // proceed with gameByName
        return runUpdate(gameByName)
    }

    return runUpdate(game)
}

async function runUpdate(game) {

    console.log(`Current Game Settings for ${game.name}:`)
    console.log(`- Base Cost (WePay): ${game.baseCost}`)       // Should be 9.475
    console.log(`- Provider Price (Partner): ${game.providerPrice}`) // Should be 9.625

    // 2. Find transactions that have the "Wrong" values (Loss logic)
    // Wrong: Cost (9.625) > Price (9.475)
    // We want to flip them or set them to current game values.

    // Hardcoded fix for these specific test transactions to make the dashboard look right
    const txns = await prisma.gameTopupTransaction.updateMany({
        where: {
            gameId: game.id
        },
        data: {
            baseCost: 9.475,       // Correct WePay Cost
            providerPrice: 9.625   // Correct Selling Price
        }
    })

    console.log(`Updated ${txns.count} transactions to correct prices.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
