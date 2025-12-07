import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const domain = 'gogotopup'
    console.log(`Checking data for domain: ${domain}`)

    const partner = await prisma.partner.findUnique({
        where: { domain },
        include: {
            gamePrices: {
                include: { game: true }
            }
        }
    })

    if (!partner) {
        console.log('Partner not found!')
        return
    }

    console.log(`Partner ID: ${partner.id}`)
    console.log(`Partner Name: ${partner.name}`)
    console.log(`Total Game Prices: ${partner.gamePrices.length}`)

    const newGames = partner.gamePrices.filter(gp =>
        gp.game.code.startsWith('mtopup_') ||
        gp.game.code.startsWith('gtopup_') ||
        gp.game.code.startsWith('cashcard_')
    )

    console.log(`Prices for NEW games (mtopup/gtopup/cashcard): ${newGames.length}`)

    // Test the grouping logic
    const gamesMap = new Map();
    partner.gamePrices.forEach(gp => {
        let company = 'Other'
        const parts = gp.game.code.split('_')
        if (['mtopup', 'gtopup', 'cashcard'].includes(parts[0]) && parts.length >= 2) {
            company = parts[1]
        } else if (parts.length > 0) {
            company = parts[0]
        }

        if (!gamesMap.has(company)) {
            gamesMap.set(company, { count: 1 });
        } else {
            gamesMap.get(company).count++;
        }
    });

    console.log(`Grouped Companies: ${gamesMap.size}`)
    console.log('Sample Companies:', Array.from(gamesMap.keys()).slice(0, 5))
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
