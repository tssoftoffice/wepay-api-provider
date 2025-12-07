import { PrismaClient } from '@prisma/client'
import { sendNotification } from '../src/lib/notification'

const prisma = new PrismaClient()

async function checkLowBalance() {
    const partners = await prisma.partner.findMany({
        where: {
            walletBalance: { lt: 1000 } // Threshold
        },
        include: { users: true }
    })

    for (const partner of partners) {
        const owner = partner.users.find(u => u.role === 'PARTNER_OWNER')
        if (owner && owner.email) {
            await sendNotification(owner.email, `Your wallet balance is low (฿${partner.walletBalance}). Please topup.`)
        }
    }
}

async function checkExpiringSubscriptions() {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const partners = await prisma.partner.findMany({
        where: {
            subscriptionStatus: 'ACTIVE',
            subscriptionEnd: { lte: nextWeek }
        },
        include: { users: true }
    })

    for (const partner of partners) {
        const owner = partner.users.find(u => u.role === 'PARTNER_OWNER')
        if (owner && owner.email) {
            await sendNotification(owner.email, `Your subscription expires on ${partner.subscriptionEnd?.toDateString()}. Please renew.`)
        }
    }
}

async function main() {
    console.log('Running background jobs...')
    await checkLowBalance()
    await checkExpiringSubscriptions()
    console.log('Jobs completed.')
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
