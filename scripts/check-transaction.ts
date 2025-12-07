const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const transaction = await prisma.subscriptionTransaction.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { partner: true }
    })

    console.log('Latest Transaction:', transaction)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
