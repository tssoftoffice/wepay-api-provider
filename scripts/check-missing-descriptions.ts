import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const total = await prisma.game.count()
    const missing = await prisma.game.count({
        where: {
            OR: [
                { description: null },
                { description: '' }
            ]
        }
    })

    console.log(`Total games: ${total}`)
    console.log(`Games with missing descriptions: ${missing}`)

    if (missing > 0) {
        console.log('Sample games with missing descriptions:')
        const samples = await prisma.game.findMany({
            where: {
                OR: [
                    { description: null },
                    { description: '' }
                ]
            },
            take: 20,
            select: { code: true, name: true }
        })
        console.table(samples)
    }
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
