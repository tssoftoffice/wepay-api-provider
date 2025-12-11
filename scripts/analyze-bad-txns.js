
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- Analyzing GoTopup Transactions ---')

    // Find partner first
    const partner = await prisma.partner.findFirst({
        where: { name: { contains: 'GoTopup' } }
    })

    if (!partner) {
        console.log('Partner GoTopup not found.')
        return
    }

    const txns = await prisma.gameTopupTransaction.findMany({
        where: { partnerId: partner.id, status: 'SUCCESS' },
        include: { game: true }
    })

    for (const t of txns) {
        const adminRevenue = Number(t.baseCost) // Partner Pays
        const adminCost = Number(t.providerPrice) // WePay Cost
        const profit = adminRevenue - adminCost

        console.log(`Txn ID: ${t.id}`)
        console.log(`Date: ${t.createdAt}`)
        console.log(`Game: ${t.game?.name}`)
        console.log(`WePay Cost (providerPrice): ${adminCost}`)
        console.log(`Partner Price (baseCost): ${adminRevenue}`)
        console.log(`Admin Profit: ${profit.toFixed(2)}`)
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
