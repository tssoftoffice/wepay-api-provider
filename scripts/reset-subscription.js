
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Searching for partners...')
    const partner = await prisma.partner.findFirst()

    if (!partner) {
        console.log('No partner found')
        return
    }

    console.log(`Found partner: ${partner.name} (${partner.id})`)
    console.log(`Current status: ${partner.subscriptionStatus}`)

    const updated = await prisma.partner.update({
        where: { id: partner.id },
        data: {
            subscriptionStatus: 'PENDING',
            subscriptionEnd: null
        }
    })

    console.log(`Updated status: ${updated.subscriptionStatus}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
