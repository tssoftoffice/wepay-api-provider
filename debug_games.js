const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const allGames = await prisma.game.count()
        console.log('Total Games:', allGames)

        const activeGames = await prisma.game.count({
            where: { status: 'ACTIVE' }
        })
        console.log('Active Games:', activeGames)

        const sample = await prisma.game.findFirst()
        console.log('Sample Game:', sample)

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
