import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Creating default partner...')

    const partner = await prisma.partner.create({
        data: {
            name: 'Go Topup',
            domain: 'gtopup',
            walletBalance: 10000,
            subscriptionStatus: 'ACTIVE', // Give them active status to start
        }
    })

    console.log(`Created partner: ${partner.name} (${partner.id})`)
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
