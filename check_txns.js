const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function check() {
    const txns = await p.gameTopupTransaction.findMany({
        where: { status: 'SUCCESS' },
        take: 5,
        select: { id: true, sellPrice: true, baseCost: true, partnerId: true }
    })
    console.log('Transactions:', txns)
    await p.$disconnect()
}

check()
