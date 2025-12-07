import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const username = 'test1'
    const amount = 5000

    console.log(`Adding ${amount} credit to user: ${username}`)

    const user = await prisma.user.findUnique({
        where: { username },
        include: { customer: true }
    })

    if (!user) {
        console.error('User not found!')
        return
    }

    if (!user.customer) {
        console.error('User is not a customer (no customer record found).')
        return
    }

    const updatedCustomer = await prisma.customer.update({
        where: { id: user.customer.id },
        data: {
            walletBalance: {
                increment: amount
            }
        }
    })

    console.log('Success!')
    console.log(`New Balance: ${updatedCustomer.walletBalance}`)
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
