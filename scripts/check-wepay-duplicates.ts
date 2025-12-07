import fs from 'fs'

const data = JSON.parse(fs.readFileSync('wepay_products.json', 'utf-8'))
const products = data.data.mtopup

let duplicates = 0

products.forEach((company: any) => {
    const prices = new Set()
    company.denomination.forEach((d: any) => {
        if (prices.has(d.price)) {
            console.log(`Duplicate price in ${company.company_id}: ${d.price}`)
            duplicates++
        }
        prices.add(d.price)
    })
})

if (duplicates === 0) {
    console.log('No duplicate prices found within companies.')
} else {
    console.log(`Found ${duplicates} duplicates.`)
}
