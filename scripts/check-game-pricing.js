
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- Checking Game Pricing Structure ---')
    const games = await prisma.game.findMany({
        take: 10,
        where: { status: 'ACTIVE' }
    })

    for (const g of games) {
        console.log(`Game: ${g.name}`)
        console.log(`  > providerPrice: ${g.providerPrice}`)
        console.log(`  > baseCost: ${g.baseCost}`)
        // console.log(`  > faceValue: ${g.faceValue}`) // Checking if faceValue exists in object
        console.log(`  > Full Object Keys: ${Object.keys(g).join(', ')}`)
        console.log('-------------------------------------------')
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
