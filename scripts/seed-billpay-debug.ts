import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding BillPay Debug...')

    const jsonPath = path.join(__dirname, '..', 'wepay_products_new.json')
    const rawData = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(rawData)
    const billpayItems = data.data.billpay

    console.log(`Found ${billpayItems.length} billpay items.`)

    let count = 0
    let errorCount = 0

    for (const company of billpayItems) {
        const companyId = company.company_id
        const companyName = company.company_name
        const min = company.minimum_amount || 0
        const max = company.maximum_amount || 0

        const code = `billpay_${companyId}`
        const name = companyName
        const description = `<p><strong>${name}</strong></p><ul><li>ชำระบิล ${min.toLocaleString()} - ${max.toLocaleString()} บาท</li><li>ค่าธรรมเนียม: ${company.fee || 0} บาท</li></ul>`

        try {
            console.log(`Upserting ${code}...`)
            await prisma.game.upsert({
                where: { code: code },
                update: {
                    name,
                    providerPrice: 0,
                    baseCost: 0,
                    status: 'ACTIVE',
                    description,
                    faceValue: 0
                },
                create: {
                    name,
                    code,
                    providerPrice: 0,
                    baseCost: 0,
                    status: 'ACTIVE',
                    description,
                    faceValue: 0
                }
            })
            count++
        } catch (e: any) {
            console.error(`Failed to upsert ${code}: ${e.message}`)
            errorCount++
        }
    }

    console.log(`BillPay Seeding Finished. Success: ${count}, Errors: ${errorCount}`)
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
