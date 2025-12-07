import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function generateKey(prefix: string, length: number = 24) {
    const randomBytes = crypto.randomBytes(length).toString('hex')
    return `${prefix}_${randomBytes}`
}

async function main() {
    console.log('Deleting all partners...')
    // Delete transactions first due to foreign key
    await prisma.gameTopupTransaction.deleteMany()
    await prisma.partnerGamePrice.deleteMany()
    await prisma.partner.deleteMany()

    console.log('Creating clean partner...')

    const apiKey = generateKey('pk')
    const secretKey = generateKey('sk', 32)

    const partner = await prisma.partner.create({
        data: {
            name: 'Go Topup',
            domain: 'gtopup',
            walletBalance: 10000,
            subscriptionStatus: 'ACTIVE',
            apiKey,
            secretKey
        }
    })

    console.log(`Created partner: ${partner.name}`)
    console.log(`API Key: ${apiKey}`)
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
