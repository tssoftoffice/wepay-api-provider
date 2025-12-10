const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Checking latest subscription transaction...')

    const transaction = await prisma.subscriptionTransaction.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { partner: true, plan: true }
    })

    if (!transaction) {
        console.log('No subscription transactions found.')
        return
    }

    console.log('Latest Transaction:')
    console.log(`- ID: ${transaction.id}`)
    console.log(`- Status: ${transaction.status}`)
    console.log(`- Amount: ${transaction.amount}`)
    console.log(`- Plan: ${transaction.plan ? transaction.plan.name : 'N/A'}`)
    console.log(`- Partner: ${transaction.partner.brandName}`)
    console.log(`- Created At: ${transaction.createdAt}`)

    console.log('\nChecking Partner Status...')
    // Reload partner to get fresh data
    const partner = await prisma.partner.findUnique({
        where: { id: transaction.partnerId }
    })

    console.log(`- Subscription Status: ${partner.subscriptionStatus}`)
    console.log(`- Subscription End: ${partner.subscriptionEnd}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
