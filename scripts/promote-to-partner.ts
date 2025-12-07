import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const username = 'darkvincess1'
    console.log(`Promoting user: ${username}`)

    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user) {
        console.log('User not found')
        return
    }

    // Transaction to promote user and create partner
    await prisma.$transaction(async (tx) => {
        // 1. Create Partner
        const partner = await tx.partner.create({
            data: {
                name: `${username}'s Store`,
                domain: username.toLowerCase(),
                subscriptionStatus: 'ACTIVE',
                apiKey: `pk_fixed_${Date.now()}`,
                secretKey: `sk_fixed_${Date.now()}`
            }
        })

        // 2. Update User
        await tx.user.update({
            where: { id: user.id },
            data: {
                role: 'PARTNER_OWNER',
                partnerId: partner.id
            }
        })

        // 3. Connect Partner to User (Many-to-Many relation side if needed, but schema uses User.partnerId)
        // Check schema: User has partnerId, Partner has users[]
        // Updating user.partnerId is sufficient.

        console.log(`User promoted to PARTNER_OWNER. Partner ID: ${partner.id}`)
    })
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
