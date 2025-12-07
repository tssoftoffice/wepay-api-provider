import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting WePay Verification Flow...')

    // 1. Setup Data
    const partnerUser = await prisma.user.create({
        data: {
            username: 'wepay_partner_' + Date.now(),
            password: await hashPassword('password123'),
            email: 'partner_wepay@test.com',
            role: 'PARTNER_OWNER',
        }
    })

    const partner = await prisma.partner.create({
        data: {
            name: 'WePay Store',
            domain: 'wepay-store-' + Date.now(),
            users: { connect: { id: partnerUser.id } },
            subscriptionStatus: 'ACTIVE',
            walletBalance: 1000
        }
    })

    const game = await prisma.game.create({
        data: {
            name: 'Test Game',
            code: 'TEST_GAME',
            baseCost: 10,
        }
    })

    await prisma.partnerGamePrice.create({
        data: {
            partnerId: partner.id,
            gameId: game.id,
            sellPrice: 20
        }
    })

    const customerUser = await prisma.user.create({
        data: {
            username: 'wepay_customer_' + Date.now(),
            password: await hashPassword('password123'),
            email: 'customer_wepay@test.com',
            role: 'CUSTOMER',
        }
    })

    const customer = await prisma.customer.create({
        data: {
            userId: customerUser.id,
            partnerId: partner.id,
            walletBalance: 100
        }
    })

    console.log('Data setup complete.')

    // 2. Simulate Topup Request (We can't call API route directly easily, so we simulate the logic or use fetch if server is running)
    // Since we are in a script, we can't easily call the Next.js API route without the server running and accessible.
    // However, the user is running `npm run dev`. So we can try to fetch localhost:3000.

    try {
        // Login as customer to get cookie? Or just mock the session in the API?
        // The API checks session. It's hard to test API route with auth from script without full login flow.
        // Let's just print instructions for manual verification or unit test the WePayClient directly.

        console.log('To verify manually:')
        console.log(`1. Login as ${customerUser.username} / password123`)
        console.log(`2. Go to /store/${partner.domain}/game/${game.id}`)
        console.log('3. Click Topup')
        console.log('4. Check server logs for WePay attempt.')

        // Let's try to test WePayClient directly if credentials exist
        if (process.env.WEPAY_USERNAME) {
            console.log('Testing WePayClient connection...')
            const { WePayClient } = require('../src/lib/wepay')
            try {
                const balance = await WePayClient.getBalance()
                console.log('WePay Balance:', balance)
            } catch (e: any) {
                console.error('WePay Connection Failed:', e.message)
            }
        } else {
            console.log('Skipping WePayClient direct test (No credentials in env)')
        }

    } catch (e) {
        console.error(e)
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
