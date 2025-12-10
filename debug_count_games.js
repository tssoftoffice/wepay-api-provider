const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const count = await prisma.game.count()
    console.log(`Total Games: ${count}`)
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
