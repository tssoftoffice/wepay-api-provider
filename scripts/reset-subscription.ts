
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Modify this to target the specific partner you are testing with
    // For now, we update the first partner found or a specific email/username if known

    // Defaulting to the partner we've been working with (usually the first one created)
    const partner = await prisma.partner.findFirst()

    if (!partner) {
        console.log('No partner found')
        return
    }

    console.log(`Resetting subscription for partner: ${partner.name} (${partner.id})`)
    console.log(`Current status: ${partner.subscriptionStatus}`)

    const updated = await prisma.partner.update({
        where: { id: partner.id },
        data: {
            subscriptionStatus: 'PENDING',
            subscriptionEnd: null // Clear end date
        }
    })

    console.log(`New status: ${updated.subscriptionStatus}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
