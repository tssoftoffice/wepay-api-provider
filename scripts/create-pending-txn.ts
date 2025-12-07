import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
    console.log('Creating Pending Transaction...')

    // 1. Get or Create Partner/Customer
    let partner = await prisma.partner.findFirst()
    if (!partner) {
        console.log('Creating Partner...')
        const user = await prisma.user.create({
            data: {
                username: 'pending_partner',
                password: await hashPassword('password'),
                role: 'PARTNER_OWNER'
            }
        })
        partner = await prisma.partner.create({
            data: {
                name: 'Pending Store',
                domain: 'pending-store',
                users: { connect: { id: user.id } },
                subscriptionStatus: 'ACTIVE',
                walletBalance: 1000
            }
        })
    }

    let customer = await prisma.customer.findFirst()
    if (!customer) {
        console.log('Creating Customer...')
        const user = await prisma.user.create({
            data: {
                username: 'pending_customer',
                password: await hashPassword('password'),
                role: 'CUSTOMER'
            }
        })
        customer = await prisma.customer.create({
            data: {
                userId: user.id,
                partnerId: partner.id,
                walletBalance: 1000
            }
        })
    }

    let game = await prisma.game.findFirst()
    if (!game) {
        game = await prisma.game.create({
            data: {
                name: 'Pending Game',
                code: 'PENDING',
                baseCost: 10
            }
        })
    }

    // 2. Create Pending Transaction
    const txn = await prisma.gameTopupTransaction.create({
        data: {
            customerId: customer.id,
            partnerId: partner.id,
            gameId: game.id,
            baseCost: 10,
            sellPrice: 20,
            status: 'PENDING'
        }
    })

    console.log(`Created Pending Transaction: ${txn.id}`)
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
