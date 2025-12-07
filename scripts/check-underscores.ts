import fs from 'fs'

const rawData = fs.readFileSync('wepay_products.json', 'utf-8')
const data = JSON.parse(rawData)

const categories = [
    { type: 'mtopup', items: data.data.mtopup },
    { type: 'gtopup', items: data.data.gtopup },
    { type: 'cashcard', items: data.data.cashcard }
]

console.log('Checking for underscores in company IDs...')
let found = false
for (const category of categories) {
    if (!category.items) continue
    for (const company of category.items) {
        if (company.company_id.includes('_')) {
            console.log(`Found underscore in ${category.type}: ${company.company_id}`)
            found = true
        }
    }
}

if (!found) {
    console.log('No underscores found in company IDs.')
}
