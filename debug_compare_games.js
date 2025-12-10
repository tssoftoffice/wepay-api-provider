const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
    console.log('Comparing JSON Source vs Database...')

    // Load JSON
    const jsonPath = path.join(__dirname, 'wepay_products_new.json')
    const rawData = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(rawData)

    const categories = [
        { type: 'mtopup', items: data.data.mtopup },
        { type: 'gtopup', items: data.data.gtopup },
        { type: 'cashcard', items: data.data.cashcard }
    ]

    let jsonCount = 0
    const jsonCodes = new Set()

    for (const category of categories) {
        if (!category.items) continue
        for (const company of category.items) {
            for (const denom of company.denomination) {
                const code = `${category.type}_${company.company_id}_${denom.price}`
                jsonCodes.add(code)
                jsonCount++
            }
        }
    }

    console.log(`JSON Total Items: ${jsonCount}`)

    // Load DB
    const games = await prisma.game.findMany()
    console.log(`Database Total Games: ${games.length}`)

    const dbCodes = new Set(games.map(g => g.code))

    // Find Missing
    const missingInDb = [...jsonCodes].filter(x => !dbCodes.has(x))

    if (missingInDb.length > 0) {
        console.log(`\nMissing in DB (${missingInDb.length}):`)
        console.log(missingInDb.slice(0, 20)) // Show first 20
        if (missingInDb.length > 20) console.log('...')
    } else {
        console.log('\nAll JSON items are present in DB.')
    }

    // Find Extra in DB (Old data?)
    const extraInDb = [...dbCodes].filter(x => !jsonCodes.has(x))
    if (extraInDb.length > 0) {
        console.log(`\nExtra in DB (${extraInDb.length}):`)
        console.log(extraInDb.slice(0, 5))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
