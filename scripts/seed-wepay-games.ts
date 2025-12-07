import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding WePay Games...')

    const rawData = fs.readFileSync('wepay_products.json', 'utf-8')
    const data = JSON.parse(rawData)

    // Combine all types
    const categories = [
        { type: 'mtopup', items: data.data.mtopup },
        { type: 'gtopup', items: data.data.gtopup },
        { type: 'cashcard', items: data.data.cashcard }
    ]

    let count = 0

    for (const category of categories) {
        if (!category.items) continue

        for (const company of category.items) {
            const companyId = company.company_id
            const companyName = company.company_name

            for (const denom of company.denomination) {
                const price = denom.price
                // Construct unique code: TYPE_COMPANY_PRICE (e.g., mtopup_12CALL_10)
                const code = `${category.type}_${companyId}_${price}`
                const name = `${companyName} ${price} THB`

                try {
                    await prisma.game.upsert({
                        where: { code: code },
                        update: {
                            name: name,
                            baseCost: price,
                            status: 'ACTIVE'
                        },
                        create: {
                            name: name,
                            code: code,
                            baseCost: price,
                            status: 'ACTIVE'
                        }
                    })
                    count++
                } catch (e: any) {
                    console.error(`Failed to seed ${code}: ${e.message}`)
                }
            }
        }
    }

    console.log(`Seeded ${count} games.`)
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
