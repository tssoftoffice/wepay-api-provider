const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateFaceValues() {
    // Parse faceValue from game code (e.g., gtopup_FREEFIRE_10 -> 10)
    const games = await prisma.game.findMany()

    for (const game of games) {
        const parts = game.code.split('_')
        const lastPart = parts[parts.length - 1]
        const faceValue = parseInt(lastPart)

        if (!isNaN(faceValue) && faceValue > 0) {
            await prisma.game.update({
                where: { id: game.id },
                data: { faceValue: faceValue }
            })
            console.log(`Updated ${game.name}: faceValue = ${faceValue}`)
        } else {
            console.log(`Skipped ${game.name}: could not parse faceValue from code "${game.code}"`)
        }
    }

    console.log('Done!')
}

updateFaceValues()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
