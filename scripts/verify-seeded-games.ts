import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.game.count()
    console.log(`Total games in DB: ${count}`)

    const sample = await prisma.game.findMany({
        take: 5,
        where: { code: { startsWith: 'mtopup_' } },
        orderBy: { code: 'asc' }
    })

    console.log('Latest 5 games:')
    sample.forEach(g => console.log(`- ${g.code}: ${g.name} (${g.baseCost})`))
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
