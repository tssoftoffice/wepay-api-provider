import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const username = 'darkvincess1'
    console.log(`Checking user: ${username}`)

    const user = await prisma.user.findUnique({
        where: { username },
        include: { partner: true }
    })

    if (!user) {
        console.log('User not found')
        return
    }

    console.log('User details:')
    console.log(`ID: ${user.id}`)
    console.log(`Role: ${user.role}`)
    console.log(`PartnerID: ${user.partnerId}`)

    if (user.partner) {
        console.log('Partner details:')
        console.log(`ID: ${user.partner.id}`)
        console.log(`Name: ${user.partner.name}`)
        console.log(`Status: ${user.partner.subscriptionStatus}`)
    } else {
        console.log('No Partner record associated.')
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
