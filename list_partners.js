const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const partners = await prisma.partner.findMany()
    console.log('Partners:', partners.map(p => ({ name: p.name, domain: p.domain })))
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
