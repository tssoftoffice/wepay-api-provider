import fs from 'fs'
import https from 'https'

const url = 'https://www.wepay.in.th/comp_export.php?json'
const file = fs.createWriteStream('wepay_products.json')

https.get(url, (response) => {
    response.pipe(file)
    file.on('finish', () => {
        file.close()
        console.log('Download completed.')
    })
}).on('error', (err) => {
    fs.unlink('wepay_products.json', () => { })
    console.error('Error downloading file:', err.message)
})
