import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const games = await prisma.game.findMany({
        take: 20,
        orderBy: { code: 'asc' }
    })

    console.log('Sample games:')
    games.forEach(g => console.log(g.code))

    const freeFire = await prisma.game.findMany({
        where: {
            name: { contains: 'Free Fire' }
        }
    })
    console.log('\nFree Fire games:')
    freeFire.forEach(g => console.log(`${g.code}: ${g.name}`))
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
