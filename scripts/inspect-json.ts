import fs from 'fs'

const rawData = fs.readFileSync('wepay_products_new.json', 'utf-8')
const data = JSON.parse(rawData)

if (data.data.gtopup && data.data.gtopup.length > 0) {
    console.log('--- Inspecting GTOPUP ---')
    const item = data.data.gtopup[0] // Check first item
    console.log('Company Name:', item.company_name)
    console.log('Keys:', Object.keys(item))

    // Check if any item in gtopup has a description or similar
    const itemWithDesc = data.data.gtopup.find((i: any) => i.product_detail || i.company_desc || i.description)
    if (itemWithDesc) {
        console.log('Found item with description:')
        console.log('Name:', itemWithDesc.company_name)
        console.log('Product Detail:', itemWithDesc.product_detail)
        console.log('Company Desc:', itemWithDesc.company_desc)
    } else {
        console.log('No description field found in ANY gtopup item.')
    }
}
