import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const game = await prisma.game.findFirst({
        where: {
            code: 'gtopup_FREEFIRE_10'
        }
    })

    if (game) {
        console.log('Game:', game.name)
        console.log('Description:', game.description)
    } else {
        console.log('Game not found')
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
