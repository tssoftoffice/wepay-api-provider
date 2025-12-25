
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const game = await prisma.game.findFirst({
        where: {
            code: { contains: 'FREEFIRE' },
            faceValue: 10
        }
    })

    if (game) {
        console.log(`Found Game: ${game.name}`)
        console.log(`ID: ${game.id}`)
        console.log(`Code: ${game.code}`)
    } else {
        console.log('Free Fire 10 THB not found')
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
