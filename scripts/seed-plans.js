const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const count = await prisma.subscriptionPlan.count()
    if (count === 0) {
        console.log('Seeding default plan...')
        await prisma.subscriptionPlan.create({
            data: {
                name: 'Starter Plan',
                price: 1.00, // Keep 1 Baht for testing as per previous context
                duration: 30,
                features: 'Full Access\n24/7 Support\nUnlimited Games',
                isActive: true
            }
        })
        console.log('Default plan created!')
    } else {
        console.log('Plans already exist.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
