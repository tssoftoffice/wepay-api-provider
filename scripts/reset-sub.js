const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const username = 'darkvinces1'
    console.log(`Searching for user: ${username}...`)

    const user = await prisma.user.findFirst({
        where: { username: username },
        include: { partner: true }
    })

    if (!user) {
        console.log('User not found.')
        return
    }

    console.log(`Found user: ${user.username} (ID: ${user.id})`)

    if (!user.partner) {
        console.log('User is not a partner.')
        return
    }

    console.log(`Partner ID: ${user.partner.id}`)

    // Reset subscription: Set subscriptionEnd to past date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    await prisma.partner.update({
        where: { id: user.partner.id },
        data: {
            subscriptionStatus: 'INACTIVE',
            subscriptionEnd: yesterday
        }
    })

    console.log('Subscription reset to INACTIVE and expired.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
