
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const targetId = 'ef30cc28-14fa-45d4-af26-8ae97424c34f'

    console.log(`Updating partner: ${targetId}`)

    const updated = await prisma.partner.update({
        where: { id: targetId },
        data: {
            subscriptionStatus: 'PENDING',
            subscriptionEnd: null
        }
    })

    console.log(`New status for ${updated.name}: ${updated.subscriptionStatus}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
