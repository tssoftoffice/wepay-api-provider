import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const games = await prisma.game.findMany({
        where: {
            OR: [
                { name: { contains: 'โปรเสริมดีแทค' } },
                { name: { contains: 'โปรเสริมทรู' } }
            ]
        },
        take: 5
    })

    console.log('Checked Games:')
    games.forEach(g => {
        console.log(`Name: ${g.name}`)
        console.log(`Code: ${g.code}`)
        console.log(`Provider Price: ${g.providerPrice}`)
        console.log(`Base Cost: ${g.baseCost}`)
        console.log(`Description Header: ${g.description?.substring(0, 50)}...`) // Just peek
        console.log('---')
    })
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
