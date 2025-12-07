
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const partner = await prisma.partner.findFirst()
    if (partner) {
        console.log(`Found Partner: ${partner.name} (ID: ${partner.id})`)
    } else {
        console.log('No partners found.')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
