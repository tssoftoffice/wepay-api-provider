import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const partnerName = 'Go Topup'
    const amount = 5000

    console.log(`Adding ${amount} credit to partner: ${partnerName}`)

    const partner = await prisma.partner.findFirst({
        where: {
            name: {
                contains: partnerName
            }
        }
    })

    if (!partner) {
        console.error('Partner not found!')
        return
    }

    const updatedPartner = await prisma.partner.update({
        where: { id: partner.id },
        data: {
            walletBalance: {
                increment: amount
            }
        }
    })

    console.log('Success!')
    console.log(`New Partner Balance: ${updatedPartner.walletBalance}`)
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
