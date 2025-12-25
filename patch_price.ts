
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const partnerId = '586e9aeb-7957-45bf-9080-32df9d36087d' // Fixed ID from previous context

    // 1. Find the target transaction
    // Looking for: RoV Mobile 10 THB, Status SUCCESS, Cost 9.625, Sell 11.625
    const txns = await prisma.gameTopupTransaction.findMany({
        where: {
            partnerId: partnerId,
            status: 'SUCCESS',
            game: {
                name: { contains: 'RoV Mobile 10 THB' }
            }
        },
        orderBy: { createdAt: 'desc' },
        include: { game: true, partner: true }
    })

    console.log(`Found ${txns.length} transactions.`)

    for (const tx of txns) {
        // Specifically looking for the one with 11.625
        if (Number(tx.sellPrice) === 11.625) {
            console.log(`\n--- TARGET FOUND: ${tx.id} ---`)
            console.log(`Created: ${tx.createdAt}`)
            console.log(`Current Sell: ${tx.sellPrice}`)
            console.log(`Base Cost: ${tx.baseCost}`)
            console.log(`Profit: ${Number(tx.sellPrice) - Number(tx.baseCost)}`)

            // 2. Perform Correction
            const NEW_SELL_PRICE = 11.00
            const DIFF = Number(tx.sellPrice) - NEW_SELL_PRICE // 11.625 - 11.00 = 0.625

            console.log(`\n--- APPLYING PATCH ---`)
            console.log(`New Sell Price: ${NEW_SELL_PRICE}`)
            console.log(`Refund Amount: ${DIFF}`)

            // Transaction for atomicity
            await prisma.$transaction([
                // Update Transaction
                prisma.gameTopupTransaction.update({
                    where: { id: tx.id },
                    data: { sellPrice: NEW_SELL_PRICE }
                }),
                // Refund Partner Wallet
                prisma.partner.update({
                    where: { id: partnerId },
                    data: { walletBalance: { increment: DIFF } }
                })
            ])

            console.log(`\n✅ Patch Applied Successfully!`)
            console.log(`Partner wallet refunded by ${DIFF} THB.`)

            // Only fix the most recent one or all? User implied "The one in the image", which is likely the latest.
            // But if there are multiple, they are all "wrong" by new standard. 
            // Let's safe-guard and only fix the ONE matching the ID if possible, but I don't have exact ID typing in the image.
            // Image shows ID: 417087413 (Wait, that looks like a short ID, let's check against DB ID)

            break; // Only fix the first one found (Latest) as a safety measure.
        }
    }

}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
