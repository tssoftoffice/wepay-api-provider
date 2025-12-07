const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const partner = await prisma.partner.findFirst({
        where: { name: 'Go Topup' }
    })

    if (!partner) {
        console.log('Partner not found')
        return
    }

    const games = await prisma.game.findMany()
    console.log(`Found ${games.length} games`)

    for (const game of games) {
        // Create a default price for this partner
        try {
            await prisma.partnerGamePrice.create({
                data: {
                    partnerId: partner.id,
                    gameId: game.id,
                    sellPrice: 120 // Dummy sell price
                }
            })
            console.log(`Assigned ${game.name} to ${partner.name}`)
        } catch (e) {
            console.log(`Game ${game.name} already assigned or error: ${e.message}`)
        }
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
