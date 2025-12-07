const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Check for 'Go Topup' partner
    const partner = await prisma.partner.findFirst({
        where: { name: 'Go Topup' },
        include: {
            gamePrices: {
                include: { game: true }
            }
        }
    })

    if (!partner) {
        console.log('Partner "Go Topup" not found')

        // List all partners to see what we have
        const partners = await prisma.partner.findMany()
        console.log('Available partners:', partners.map(p => ({ name: p.name, domain: p.domain })))
        return
    }

    console.log('Partner:', partner.name)
    console.log('Domain:', partner.domain)
    console.log('Game Prices Count:', partner.gamePrices.length)

    if (partner.gamePrices.length === 0) {
        console.log('This partner has no games assigned!')
    } else {
        console.log('Games:', partner.gamePrices.map(gp => gp.game.name))
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
