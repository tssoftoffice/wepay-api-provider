import axios from 'axios'
import fs from 'fs'

async function main() {
    console.log('Fetching WePay products...')
    const url = 'https://www.wepay.in.th/comp_export.php?json'
    try {
        const response = await axios.get(url)
        fs.writeFileSync('wepay_products.json', JSON.stringify(response.data, null, 2))
        console.log('Saved to wepay_products.json')
    } catch (error: any) {
        console.error('Error fetching products:', error.message)
    }
}

main()
