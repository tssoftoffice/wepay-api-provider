
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- ALL PARTNERS ---')
    const partners = await prisma.partner.findMany()

    partners.forEach(p => {
        console.log(`ID: ${p.id}`)
        console.log(`Name: ${p.name}`)
        console.log(`Status: ${p.subscriptionStatus}`)
        console.log('-------------------')
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
