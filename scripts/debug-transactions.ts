
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching last 10 SUCCESS transactions...')
    const txns = await prisma.gameTopupTransaction.findMany({
        where: { status: 'SUCCESS' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { partner: { select: { name: true } } }
    })

    console.log('Found:', txns.length)

    for (const t of txns) {
        const sell = t.sellPrice.toNumber()
        const base = t.baseCost.toNumber()
        const provider = t.providerPrice.toNumber()
        const partnerProfit = sell - base
        const systemProfit = base - provider

        console.log(`[${t.id}] Partner: ${t.partner.name}`)
        console.log(`  CreatedAt: ${t.createdAt}`)
        console.log(`  SellPrice (User Pays): ${sell}`)
        console.log(`  BaseCost (Partner Pays): ${base}`)
        console.log(`  ProviderPrice (System Pays): ${provider}`)
        console.log(`  -> Partner Profit: ${partnerProfit.toFixed(4)}`)
        console.log(`  -> System Profit: ${systemProfit.toFixed(4)}`)
        console.log('---')
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
