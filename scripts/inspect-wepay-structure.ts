import fs from 'fs'

const rawData = fs.readFileSync('wepay_products.json', 'utf-8')
const data = JSON.parse(rawData)

console.log('--- gtopup sample ---')
if (data.data.gtopup && data.data.gtopup.length > 0) {
    console.log(JSON.stringify(data.data.gtopup[0], null, 2))
}

console.log('--- cashcard sample ---')
if (data.data.cashcard && data.data.cashcard.length > 0) {
    console.log(JSON.stringify(data.data.cashcard[0], null, 2))
}
