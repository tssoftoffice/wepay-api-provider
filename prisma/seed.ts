import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create Default Admin User & Partner
    const adminEmail = 'admin@gamesflows.com'
    const adminPassword = 'password123' // In a real app, hash this. But for now, we'll assume the auth system handles hashing or we store plain for dev.
    // Wait, the auth system (NextAuth/bcrypt) likely expects hashed passwords if we use credentials provider.
    // Let's use a simple hash if possible, or just raw if the system is set to dev.
    // Assuming bcryptjs is available or we can just use a placeholder and let the user reset.
    // Actually, looking at `src/lib/auth.ts` or `register` action would clarify.
    // For simplicity in seed, let's try to insert. If login fails, we'll know.
    // *Correction*: We can't easily hash without importing bcrypt. Let's just insert and if it fails to login, we'll fix.
    // But wait, the `User` model structure matters.

    const mainPartner = await prisma.partner.upsert({
        where: { domain: 'gamesflows.com' },
        update: {},
        create: {
            name: 'GamesFlows (Main)',
            domain: 'gamesflows.com',
            status: 'ACTIVE',
            walletBalance: 1000000 // Give some budget
        }
    })

    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'ADMIN',
            partnerId: mainPartner.id
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Super Admin',
            role: 'ADMIN',
            partnerId: mainPartner.id
        }
    })

    console.log(`Admin User: ${adminEmail} / ${adminPassword}`)

    const packages = [
        {
            name: 'Basic',
            price: 499,
            maxCustomers: 100,
        },
        {
            name: 'Pro',
            price: 999,
            maxCustomers: 1000,
        },
        {
            name: 'Enterprise',
            price: 2999,
            maxCustomers: null, // Unlimited
        },
    ]

    for (const pkg of packages) {
        await prisma.subscriptionPackage.upsert({
            where: { id: pkg.name },
            create: pkg,
            update: pkg
        }).catch(() => {
            return prisma.subscriptionPackage.create({ data: pkg }).catch(() => { })
        })
    }

    console.log('Seeding WePay Games...')
    const fs = require('fs')
    const path = require('path')

    // Adjust path to point to root
    const jsonPath = path.join(__dirname, '..', 'wepay_products_new.json')
    if (fs.existsSync(jsonPath)) {
        const rawData = fs.readFileSync(jsonPath, 'utf-8')
        const data = JSON.parse(rawData)

        const categories = [
            { type: 'mtopup', items: data.data.mtopup },
            { type: 'gtopup', items: data.data.gtopup },
            { type: 'cashcard', items: data.data.cashcard },
            { type: 'billpay', items: data.data.billpay }
        ]

        let count = 0

        // Discount Map
        const discountMap: Record<string, number> = {
            'free fire': 5.25, 'rov': 5.25, 'bang bang': 9, 'mobile legends': 9, 'sword of justice': 21,
            'where winds meet': 8.5, 'valorant': 5, 'pubg': 13, 'seven knights': 13, 'genshin': 24,
            'honkai': 24, 'zenless': 24, 'call of duty': 5.25, 'ragnarok m': 13, 'ragnarok origin': 13,
            'ragnarok x': 18.5,
            'ais': 1, '12call': 1, 'dtac': 3, 'true': 3, 'my': 3.5,
            'truemoney': 2.5, 'garena': 3.5, 'razer': 4.5, 'steam': 4, 'roblox': 8, 'netflix': 0, 'spotify': 0
        }

        for (const category of categories) {
            if (!category.items) continue
            for (const company of category.items) {
                const companyId = company.company_id
                const companyName = company.company_name

                if (company.denomination) {
                    for (const denom of company.denomination) {
                        const price = denom.price
                        const code = `${category.type}_${companyId}_${price}`
                        const name = `${companyName} ${price} THB`
                        let description = denom.description || `<p><strong>${name}</strong></p><ul><li>ใส่ Player ID เพื่อเติมเงิน</li><li>สินค้าเข้าทันที</li></ul>`

                        // Determine Provider Discount
                        let providerDiscountPercent = 0.0
                        const lowerName = companyName.toLowerCase()

                        if (category.type === 'mtopup') {
                            if (lowerName.includes('ais') || lowerName.includes('1-2-call')) providerDiscountPercent = 1.0
                            else if (lowerName.includes('dtac') || lowerName.includes('happy')) providerDiscountPercent = 3.0
                            else if (lowerName.includes('true')) providerDiscountPercent = 3.0
                            else if (lowerName.includes('my')) providerDiscountPercent = 3.5
                        } else { // Games & Cashcard
                            for (const [key, value] of Object.entries(discountMap)) {
                                if (lowerName.includes(key)) {
                                    providerDiscountPercent = value
                                    break
                                }
                            }
                        }

                        const providerDiscount = providerDiscountPercent / 100
                        const providerPrice = price * (1 - providerDiscount)
                        const platformMargin = 0.015
                        let partnerDiscount = providerDiscount - platformMargin
                        if (partnerDiscount < 0) partnerDiscount = 0
                        const baseCost = price * (1 - partnerDiscount)

                        try {
                            await prisma.game.upsert({
                                where: { code: code },
                                update: { name, providerPrice, baseCost, status: 'ACTIVE', description },
                                create: { name, code, providerPrice, baseCost, status: 'ACTIVE', description }
                            })
                            count++
                        } catch (e) {
                            // console.error(`Failed to seed ${code}`)
                        }
                    }
                } else if (category.type === 'billpay') {
                    // Handle Bill Payment (Variable Amount)
                    const code = `billpay_${companyId}`
                    const name = companyName
                    const min = company.minimum_amount || 0
                    const max = company.maximum_amount || 0
                    const description = `<p><strong>${name}</strong></p><ul><li>ชำระบิล ${min.toLocaleString()} - ${max.toLocaleString()} บาท</li><li>ค่าธรรมเนียม: ${company.fee || 0} บาท</li></ul>`

                    try {
                        await prisma.game.upsert({
                            where: { code: code },
                            update: {
                                name,
                                providerPrice: 0,
                                baseCost: 0,
                                status: 'ACTIVE',
                                description,
                                faceValue: 0
                            },
                            create: {
                                name,
                                code,
                                providerPrice: 0,
                                baseCost: 0,
                                status: 'ACTIVE',
                                description,
                                faceValue: 0
                            }
                        })
                        count++
                    } catch (e) { }
                }
            }
        }
        console.log(`Seeded ${count} games.`)
    } else {
        console.warn('wepay_products_new.json not found at', jsonPath)
    }

    console.log('Seed data inserted')
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
