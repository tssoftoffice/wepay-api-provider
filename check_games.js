const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const games = await prisma.game.findMany()
    console.log('Existing Games:', games.map(g => g.name))
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
