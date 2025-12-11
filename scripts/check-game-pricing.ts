
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Checking Game Pricing Structure ---')
    const games = await prisma.game.findMany({
        take: 5,
        where: { status: 'ACTIVE' }
    })

    for (const g of games) {
        console.log(`Game: ${g.name} (${g.code})`)
        console.log(`  > localPrice (Face?): N/A`) // Schema doesn't strictly have faceValue in seed update but code might
        console.log(`  > providerPrice: ${g.providerPrice}`)
        console.log(`  > baseCost: ${g.baseCost}`)

        // Infer Face Value from name if possible
        const match = g.name.match(/(\d+(?:,\d+)*)\s*THB/)
        const faceValue = match ? parseFloat(match[1].replace(/,/g, '')) : 0
        console.log(`  > Face Value (Inferred): ${faceValue}`)

        if (faceValue > 0) {
            const providerDiscount = (faceValue - Number(g.providerPrice)) / faceValue * 100
            const baseDiscount = (faceValue - Number(g.baseCost)) / faceValue * 100
            console.log(`  > providerPrice % Off: ${providerDiscount.toFixed(2)}%`)
            console.log(`  > baseCost % Off: ${baseDiscount.toFixed(2)}%`)
        }
        console.log('-------------------------------------------')
    }

    console.log('\n--- Checking Transaction Pricing (Latest 5) ---')
    const txns = await prisma.gameTopupTransaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    })

    for (const t of txns) {
        console.log(`txn: ${t.id} - Sell: ${t.sellPrice}, Prov: ${t.providerPrice}, Base: ${t.baseCost}`)
    }
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
