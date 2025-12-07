const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const domain = 'test-store' // Correct domain
    const partner = await prisma.partner.findUnique({
        where: { domain },
        include: {
            gamePrices: {
                include: { game: true }
            }
        }
    })

    if (!partner) {
        console.log('Partner not found')
        return
    }

    console.log('Partner:', partner.name)
    console.log('Game Prices:', partner.gamePrices.length)

    if (partner.gamePrices.length > 0) {
        const gp = partner.gamePrices[0]
        console.log('First Game:', gp.game.name, 'ID:', gp.gameId)
        console.log('Link should be:', `/store/${domain}/game/${gp.gameId}`)
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
