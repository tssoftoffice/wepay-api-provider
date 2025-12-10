const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Fixing Face Values for Games...')

    const games = await prisma.game.findMany({
        where: {
            code: { startsWith: 'gtopup_' }
        }
    })

    console.log(`Found ${games.length} games to parse.`)

    for (const game of games) {
        const parts = game.code.split('_')
        if (parts.length >= 3) {
            // e.g. gtopup_FREEFIRE_10
            // amount is parts[2]
            const amountStr = parts[parts.length - 1]
            const amount = parseInt(amountStr)

            if (!isNaN(amount) && amount > 0) {
                await prisma.game.update({
                    where: { id: game.id },
                    data: { faceValue: amount }
                })
                console.log(`Updated ${game.name}: Set FaceValue to ${amount}`)
            }
        }
    }
    console.log('Done.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
