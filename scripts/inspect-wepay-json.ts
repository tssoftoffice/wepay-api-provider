async function main() {
    console.log('Fetching WePay data...')
    const response = await fetch('https://www.wepay.in.th/comp_export.php?json')
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
    }
    const data = await response.json()

    // Search for TRMV with price 790
    console.log('Searching for TRMV 790...')

    const mtopup = data.data.mtopup
    const trmv = mtopup.find((c: any) => c.company_id === 'TRMV')

    if (trmv) {
        const item = trmv.denomination.find((d: any) => d.price == 790)
        console.log('Found item:', JSON.stringify(item, null, 2))
    } else {
        console.log('TRMV not found')
    }
}

main()
