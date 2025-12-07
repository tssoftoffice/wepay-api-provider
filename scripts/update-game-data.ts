import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching WePay data...')
    const response = await fetch('https://www.wepay.in.th/comp_export.php?json')
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
    }
    const data = await response.json()

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

            // Check for servers
            let servers = null
            if (company.gameservers && Array.isArray(company.gameservers) && company.gameservers.length > 0) {
                servers = JSON.stringify(company.gameservers)
            }

            for (const denom of company.denomination) {
                const price = denom.price
                let description = denom.description

                // Construct unique code: TYPE_COMPANY_PRICE
                const code = `${category.type}_${companyId}_${price}`

                // If description is missing, create a default one
                if (!description) {
                    description = `<b>${companyName} ${price} THB</b>`
                }

                // Construct update data
                const dataToUpdate: any = {}
                dataToUpdate.description = description

                if (servers) {
                    dataToUpdate.servers = servers
                }

                try {
                    const result = await prisma.game.updateMany({
                        where: { code: code },
                        data: dataToUpdate
                    })
                    if (result.count > 0) {
                        count++
                    }
                } catch (e: any) {
                    console.error(`Failed to update ${code}: ${e.message}`)
                }
            }
        }
    }

    console.log(`Updated data for ${count} games.`)
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
