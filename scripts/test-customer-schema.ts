
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const customer = await prisma.customer.findFirst({
            select: { createdAt: true }
        })
        console.log('Customer createdAt check:', customer)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
