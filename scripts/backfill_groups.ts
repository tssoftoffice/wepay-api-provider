import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching games...')
    const games = await prisma.game.findMany({
        where: { group: null }
    })

    console.log(`Found ${games.length} games to update.`)
    let count = 0

    for (const game of games) {
        let group = 'Other'
        const parts = game.code.split('_')

        // Logic from PricingContent.tsx
        if (['mtopup', 'gtopup', 'cashcard'].includes(parts[0]) && parts.length >= 2) {
            group = parts[1]
        } else if (parts.length > 0) {
            group = parts[0]
        }

        group = group.toUpperCase()

        await prisma.game.update({
            where: { id: game.id },
            data: { group }
        })
        count++
        if (count % 100 === 0) console.log(`Updated ${count} games...`)
    }

    console.log('Done!')
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
