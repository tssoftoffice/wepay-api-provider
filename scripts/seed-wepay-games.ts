import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding WePay Games...')

    const rawData = fs.readFileSync('wepay_products_new.json', 'utf-8')
    const data = JSON.parse(rawData)

    // Combine all types
    const categories = [
        { type: 'mtopup', items: data.data.mtopup },
        { type: 'gtopup', items: data.data.gtopup },
        { type: 'cashcard', items: data.data.cashcard }
    ]

    let count = 0

    // Pricing Configuration (Provider Discounts)
    const discountMap: Record<string, number> = {
        // Games (gtopup)
        'free fire': 5.25,
        'rov': 5.25,
        'bang bang': 9, 'mobile legends': 9,
        'sword of justice': 21,
        'where winds meet': 8.5,
        'valorant': 5,
        'delta force steam': 24,
        'delta force garena': 5.25,
        'pubg mobile': 13, 'pubg': 13,
        'uc station': 12.5,
        'seven knights': 13,
        'bigo live': 7,
        'racing master': 20,
        'honor of kings': 10,
        'dunk city': 16,
        'call of duty': 5.25,
        'blood strike': 33.5,
        'identity v': 17,
        'league of legends': 5,
        'magic chess': 18.5,
        'haikyu': 9.75,
        'ragnarok m': 13,
        'classic': 12.5,
        'love and deepspace': 9,
        'afk journey': 5,
        'metal slug': 5,
        'arena breakout': 25,
        'genshin': 24,
        'zenless': 24,
        'honkai': 24,
        'dragon nest': 25,
        'maplestory': 6,
        'undawn': 5.25,
        'fc mobile': 7.5, 'fifa': 7.5,
        'zepto': 44,
        'diablo iv': 12.5,
        'teamfight tactics': 5,
        'ragnarok original': 13,
        'seal m': 18.5,
        'ragnarok x': 18.5,
        'harry potter': 23.5,
        'ace racer': 19,
        'mu origin 3': 9,
        'diablo immortal': 15.5,
        'sausage man': 18.5,
        'super sus': 7,
        'marvel snap': 13,
        'x-hero': 18.5,
        'nikke': 18.5,
        'overwatch': 12.5,
        'mu archangel': 8.5,
        'onmyoji': 16,
        'runeterra': 5,
        'wild rift': 5,
        'dragon raja': 18.5,
        'counter:side': 8.5,
        'eos red': 8.5,

        // Mobile Topup (mtopup)
        'ais': 1, '12call': 1, 'one-2-call': 1,
        'dtac': 3, 'happy': 3,
        'truemove': 3, 'trmv': 3,
        'my by nt': 3.5, 'my': 3.5, 'cat': 3.5,

        // Cash Cards (cashcard)
        'truemoney': 2.5, 'tmn': 2.5,
        'garena card': 3.5, 'garena': 3.5,
        'geforce now': 12.5,
        'geforce now sg': 9,
        'riot': 11,
        'razer': 4.5, 'mol': 4.5,
        'roblox': 8,
        'steam': 4,
        '@cash': 2, 'acash': 2, 'asiasoft': 2,
        'starbucks': 10,
        'playstation': 5, 'psn': 5,
        'nintendo': 0,
        'ex cash': 8, 'excash': 8,
        'gameindy': 6,
        'line': 3.5,
        'battle.net': 15, 'blizzard': 15
    }

    for (const category of categories) {
        if (!category.items) continue

        for (const company of category.items) {
            const companyId = company.company_id
            const companyName = company.company_name

            for (const denom of company.denomination) {
                const price = denom.price
                const code = `${category.type}_${companyId}_${price}`
                const name = `${companyName} ${price} THB`

                // Use description from JSON if available, otherwise default template
                let description = denom.description
                if (!description) {
                    description = `<p><strong>${name}</strong></p><ul><li>ใส่ Player ID เพื่อเติมเงิน</li><li>สินค้าเข้าทันที</li></ul>`
                }

                // Determine Provider Discount
                let providerDiscountPercent = 0.0
                const lowerName = companyName.toLowerCase()
                const lowerNameFull = name.toLowerCase()
                const upperId = companyId.toUpperCase()

                if (category.type === 'mtopup') {
                    // Mobile & Packages
                    // Check for Package/Supplement indicators
                    // "แพ็กเกจ" = Package, "โปรเสริม" = Supplement/Add-on
                    const isPackage = upperId.includes('AOP') || lowerName.includes('แพ็กเกจ') || lowerName.includes('โปรเสริม')

                    if (lowerName.includes('ais') || lowerName.includes('1-2-call') || upperId.includes('12CALL')) {
                        providerDiscountPercent = isPackage ? 1.5 : 1.0
                    } else if (lowerName.includes('dtac') || lowerName.includes('happy') || upperId.includes('HAPPY')) {
                        providerDiscountPercent = isPackage ? 4.0 : 3.0
                    } else if (lowerName.includes('true') || upperId.includes('TRMV')) {
                        providerDiscountPercent = isPackage ? 4.0 : 3.0
                    } else if (lowerName.includes('my') || upperId.includes('MY')) {
                        providerDiscountPercent = isPackage ? 4.0 : 3.5
                    }
                } else if (category.type === 'cashcard') {
                    // Cash Cards specific logic
                    if (lowerName.includes('geforce')) {
                        if (lowerName.includes('singapore') || lowerName.includes('sg')) providerDiscountPercent = 9.0
                        else providerDiscountPercent = 12.5
                    } else {
                        // General match from map
                        for (const [key, value] of Object.entries(discountMap)) {
                            if (lowerName.includes(key) || upperId.toLowerCase().includes(key)) {
                                providerDiscountPercent = value
                                break
                            }
                        }
                    }
                } else {
                    // Games (gtopup) - Previous Logic
                    if (lowerName.includes('free fire')) providerDiscountPercent = 5.25
                    else if (lowerName.includes('rov')) providerDiscountPercent = 5.25
                    else if (lowerName.includes('bang bang') || lowerName.includes('mobile legends')) providerDiscountPercent = 9
                    else if (lowerName.includes('sword of justice')) providerDiscountPercent = 21
                    else if (lowerName.includes('pubg')) {
                        if (lowerName.includes('thai')) providerDiscountPercent = 15
                        else if (lowerNameFull.includes('uc station')) providerDiscountPercent = 12.5
                        else providerDiscountPercent = 13
                    }
                    else if (lowerName.includes('ragnarok m')) {
                        if (lowerName.includes('classic')) providerDiscountPercent = 12.5
                        else providerDiscountPercent = 13
                    }
                    else if (lowerName.includes('delta force')) {
                        if (lowerName.includes('steam')) providerDiscountPercent = 24
                        else providerDiscountPercent = 5.25 // Garena
                    }
                    else {
                        // Match from map
                        for (const [key, value] of Object.entries(discountMap)) {
                            if (lowerName.includes(key)) {
                                providerDiscountPercent = value
                                break
                            }
                        }
                    }
                }

                // Calculate Provider Price
                const providerDiscount = providerDiscountPercent / 100
                const providerPrice = price * (1 - providerDiscount)

                // Calculate Base Cost (Partner Price)
                // Margin 1.5% fixed for now (User asked for 1-2%)
                const platformMargin = 0.015
                let partnerDiscount = providerDiscount - platformMargin
                if (partnerDiscount < 0) partnerDiscount = 0

                const baseCost = price * (1 - partnerDiscount)

                try {
                    await prisma.game.upsert({
                        where: { code: code },
                        update: {
                            name: name,
                            providerPrice,
                            baseCost,
                            status: 'ACTIVE',
                            description: description
                        },
                        create: {
                            name: name,
                            code: code,
                            providerPrice,
                            baseCost,
                            status: 'ACTIVE',
                            description: description
                        }
                    })
                    count++
                } catch (e: any) {
                    console.error(`Failed to seed ${code}: ${e.message}`)
                }
            }
        }
    }

    console.log(`Seeded ${count} games.`)
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
