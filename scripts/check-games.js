const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Checking FREEFIRE Games...')

    const games = await prisma.game.findMany({
        where: { code: { contains: 'FREEFIRE' } }
    })

    if (games.length === 0) {
        console.log('No FREEFIRE games found.')
        return
    }

    games.forEach(g => {
        console.log(`--- Game: ${g.name} ---`)
        console.log(`ID: ${g.id}`)
        console.log(`Code: ${g.code}`)
        console.log(`Face Value: ${g.faceValue}`)
        console.log(`Base Cost: ${g.baseCost}`)
        console.log(`Provider Price: ${g.providerPrice}`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
