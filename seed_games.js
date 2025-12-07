const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const gamesList = [
    'Free Fire', 'ROV', 'Mobile Legends', 'Valorant', 'PUBG Mobile', 'Genshin Impact',
    'Roblox', 'Call of Duty', 'FIFA Mobile', 'League of Legends', 'Honkai Star Rail', 'Cookie Run',
    'Ragnarok Origin', 'Undawn', 'Zepeto', 'Diablo Immortal', 'Sausage Man', 'Super Sus',
    'Marvel Snap', 'Nikke', 'Overwatch 2', 'Ragnarok M', 'MU Origin 3', 'Dragon Raja'
]

async function main() {
    const partner = await prisma.partner.findFirst({
        where: { name: 'Go Topup' }
    })

    if (!partner) {
        console.log('Partner "Go Topup" not found')
        return
    }

    console.log(`Seeding games for partner: ${partner.name}`)

    for (const gameName of gamesList) {
        // Check if game exists
        let game = await prisma.game.findFirst({
            where: { name: gameName }
        })

        if (!game) {
            // Create game
            game = await prisma.game.create({
                data: {
                    name: gameName,
                    code: gameName.toUpperCase().replace(/\s+/g, '_'),
                    baseCost: 90,
                    status: 'ACTIVE'
                }
            })
            console.log(`Created game: ${game.name}`)
        } else {
            console.log(`Game exists: ${game.name}`)
        }

        // Assign to partner
        try {
            await prisma.partnerGamePrice.upsert({
                where: {
                    partnerId_gameId: {
                        partnerId: partner.id,
                        gameId: game.id
                    }
                },
                update: {}, // Do nothing if exists
                create: {
                    partnerId: partner.id,
                    gameId: game.id,
                    sellPrice: 100
                }
            })
            console.log(`Assigned ${game.name} to partner`)
        } catch (e) {
            console.log(`Error assigning ${game.name}: ${e.message}`)
        }
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
