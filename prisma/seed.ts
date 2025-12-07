import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const packages = [
        {
            name: 'Basic',
            price: 499,
            maxCustomers: 100,
        },
        {
            name: 'Pro',
            price: 999,
            maxCustomers: 1000,
        },
        {
            name: 'Enterprise',
            price: 2999,
            maxCustomers: null, // Unlimited
        },
    ]

    for (const pkg of packages) {
        await prisma.subscriptionPackage.create({
            data: pkg,
        })
    }

    console.log('Seed data inserted')
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
