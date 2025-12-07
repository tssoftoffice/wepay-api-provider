import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking Genshin Impact servers...')
    const games = await prisma.game.findMany({
        where: {
            name: {
                contains: 'Genshin'
            }
        }
    })

    if (games.length === 0) {
        console.log('No Genshin games found.')
    } else {
        console.log(`Found ${games.length} Genshin games.`)
        games.forEach(g => {
            console.log(`- ${g.name} (${g.code}): servers=${g.servers}`)
        })
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
