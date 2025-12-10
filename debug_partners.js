const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const count = await prisma.partner.count()
        console.log('Total Partners:', count)

        const partners = await prisma.partner.findMany({
            take: 5,
            include: { users: true }
        })
        console.log('Sample Partners:', JSON.stringify(partners, null, 2))
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
