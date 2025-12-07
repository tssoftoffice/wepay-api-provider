import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Searching for "Go Topup" partner...')
    const partner = await prisma.partner.findFirst({
        where: {
            name: {
                contains: 'Go Topup'
            }
        }
    })

    if (!partner) {
        console.log('No partner found with name "Go Topup"')
        return
    }

    console.log(`Found partner: ${partner.name} (${partner.id})`)
    console.log(`Current Status: ${partner.subscriptionStatus}`)

    const updated = await prisma.partner.update({
        where: { id: partner.id },
        data: {
            subscriptionStatus: 'PENDING',
            subscriptionEnd: null,
            packageId: null
        }
    })

    console.log('--------------------------------')
    console.log('Subscription Reset Complete')
    console.log(`New Status: ${updated.subscriptionStatus}`)
    console.log(`Package ID: ${updated.packageId}`)
    console.log(`End Date: ${updated.subscriptionEnd}`)
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
