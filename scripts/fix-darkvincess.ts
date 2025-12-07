import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function generateKey(prefix: string, length: number = 24) {
    const randomBytes = crypto.randomBytes(length).toString('hex')
    return `${prefix}_${randomBytes}`
}

async function main() {
    console.log('Finding user darkvincess1...')
    const user = await prisma.user.findFirst({
        where: { username: { contains: 'darkvincess' } } // loose match
    })

    if (!user) {
        console.error('User not found!')
        return
    }

    console.log(`Found user: ${user.username} (${user.id})`)

    const apiKey = generateKey('pk')
    const secretKey = generateKey('sk', 32)

    console.log('Creating partner for user...')
    const partner = await prisma.partner.create({
        data: {
            name: user.firstName ? `${user.firstName}'s Store` : 'My Store',
            domain: user.username, // Use username as domain
            subscriptionStatus: 'ACTIVE',
            walletBalance: 0,
            apiKey,
            secretKey
        }
    })

    console.log(`Created partner: ${partner.name} (Domain: ${partner.domain})`)

    console.log('Linking user to partner...')
    await prisma.user.update({
        where: { id: user.id },
        data: { partnerId: partner.id }
    })

    console.log('Done! User linked.')
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
