import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting Verification Flow...')

    // 1. Register Partner
    console.log('1. Registering Partner...')
    const partnerUser = await prisma.user.create({
        data: {
            username: 'partner_test',
            password: await hashPassword('password123'),
            email: 'partner@test.com',
            role: 'PARTNER_OWNER',
        }
    })

    const partner = await prisma.partner.create({
        data: {
            name: 'Test Game Store',
            domain: 'test-store',
            users: { connect: { id: partnerUser.id } }
        }
    })

    await prisma.user.update({
        where: { id: partnerUser.id },
        data: { partnerId: partner.id }
    })
    console.log('   Partner created:', partner.name)

    // 2. Partner Subscribe
    console.log('2. Partner Subscribing...')
    const pkg = await prisma.subscriptionPackage.findFirst()
    if (!pkg) throw new Error('No subscription package found')

    await prisma.partner.update({
        where: { id: partner.id },
        data: {
            packageId: pkg.id,
            subscriptionStatus: 'ACTIVE', // Simulate payment success
            subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    })
    console.log('   Partner subscribed to:', pkg.name)

    // 3. Partner Topup
    console.log('3. Partner Topup...')
    await prisma.partner.update({
        where: { id: partner.id },
        data: { walletBalance: { increment: 5000 } }
    })
    console.log('   Partner wallet balance:', 5000)

    // 4. Create Game and Set Price
    console.log('4. Creating Game and Setting Price...')
    const game = await prisma.game.create({
        data: {
            name: 'ROV 100 Diamonds',
            code: 'rov-100',
            baseCost: 90,
        }
    })

    await prisma.partnerGamePrice.create({
        data: {
            partnerId: partner.id,
            gameId: game.id,
            sellPrice: 100
        }
    })
    console.log('   Game created and price set')

    // 5. Register Customer
    console.log('5. Registering Customer...')
    const customerUser = await prisma.user.create({
        data: {
            username: 'customer_test',
            password: await hashPassword('password123'),
            email: 'customer@test.com',
            role: 'CUSTOMER',
        }
    })

    const customer = await prisma.customer.create({
        data: {
            userId: customerUser.id,
            partnerId: partner.id
        }
    })
    console.log('   Customer created')

    // 6. Customer Topup
    console.log('6. Customer Topup...')
    await prisma.customer.update({
        where: { id: customer.id },
        data: { walletBalance: { increment: 200 } }
    })
    console.log('   Customer wallet balance:', 200)

    // 7. Customer Buy Game
    console.log('7. Customer Buying Game...')
    // Simulate Transaction Logic
    const sellPrice = 100
    const baseCost = 90

    await prisma.$transaction(async (tx) => {
        // Deduct Customer
        await tx.customer.update({
            where: { id: customer.id },
            data: { walletBalance: { decrement: sellPrice } }
        })

        // Deduct Partner
        await tx.partner.update({
            where: { id: partner.id },
            data: { walletBalance: { decrement: baseCost } }
        })

        // Create Txn
        await tx.gameTopupTransaction.create({
            data: {
                customerId: customer.id,
                partnerId: partner.id,
                gameId: game.id,
                baseCost: baseCost,
                sellPrice: sellPrice,
                status: 'SUCCESS',
                providerTxnId: 'mock-wepay-123'
            }
        })
    })
    console.log('   Purchase successful!')

    // Final Check
    const finalPartner = await prisma.partner.findUnique({ where: { id: partner.id } })
    const finalCustomer = await prisma.customer.findUnique({ where: { id: customer.id } })

    console.log('Final Partner Balance:', finalPartner?.walletBalance.toString()) // Should be 5000 - 90 = 4910
    console.log('Final Customer Balance:', finalCustomer?.walletBalance.toString()) // Should be 200 - 100 = 100

    if (Number(finalPartner?.walletBalance) === 4910 && Number(finalCustomer?.walletBalance) === 100) {
        console.log('VERIFICATION PASSED ✅')
    } else {
        console.error('VERIFICATION FAILED ❌')
        process.exit(1)
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
