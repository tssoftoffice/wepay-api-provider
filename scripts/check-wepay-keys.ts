import fs from 'fs'

const rawData = fs.readFileSync('wepay_products.json', 'utf-8')
const data = JSON.parse(rawData)

console.log('Keys in data:', Object.keys(data.data))
