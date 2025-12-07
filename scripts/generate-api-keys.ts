import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function generateKey(prefix: string, length: number = 24) {
    const randomBytes = crypto.randomBytes(length).toString('hex')
    return `${prefix}_${randomBytes}`
}

async function main() {
    console.log('Fetching partners...')
    const partners = await prisma.partner.findMany()

    console.log(`Found ${partners.length} partners.`)

    for (const partner of partners) {
        if (partner.apiKey && partner.secretKey) {
            console.log(`Partner [${partner.name}] already has keys.`)
            console.log(`  API Key: ${partner.apiKey}`)
            continue
        }

        console.log(`Generating keys for [${partner.name}]...`)

        const apiKey = generateKey('pk')
        const secretKey = generateKey('sk', 32)

        await prisma.partner.update({
            where: { id: partner.id },
            data: {
                apiKey,
                secretKey
            }
        })

        console.log(`  API Key: ${apiKey}`)
        console.log(`  Secret Key: ${secretKey}`)
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
