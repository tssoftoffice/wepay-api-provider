import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000/api/v1'

async function main() {
    console.log('Test: Finding API Key...')
    // 1. Get an API Key
    const partner = await prisma.partner.findFirst({
        where: { apiKey: { not: null } }
    })

    if (!partner || !partner.apiKey || !partner.secretKey) {
        console.error('No partner with API Key/Secret found. Run key generation script first.')
        return
    }

    const apiKey = partner.apiKey
    const secretKey = partner.secretKey
    console.log(`Using API Key: ${apiKey}`)

    const client = axios.create({
        baseURL: BASE_URL,
        headers: {
            'X-API-KEY': apiKey,
            'X-API-SECRET': secretKey
        }
    })

    try {
        // 2. Test Balance
        console.log('\n--- Test: Get Balance ---')
        const balanceRes = await client.get('/balance')
        console.log('Balance:', balanceRes.data.data)

        // 3. Test Games
        console.log('\n--- Test: Get Games ---')
        const gamesRes = await client.get('/games')
        const games = gamesRes.data.data
        console.log(`Retrieved ${games.length} games.`)

        if (games.length > 0) {
            console.log('Sample Game:', games[0])

            // Find a cheap game to test (Free Fire 10 THB)
            const testGame = games.find((g: any) => g.name.includes('Free Fire 10 THB') || g.price < 20)

            if (testGame) {
                // 4. Test Topup
                console.log(`\n--- Test: Topup (${testGame.name}) ---`)
                try {
                    const topupRes = await client.post('/topup', {
                        game_id: testGame.id,
                        player_id: '12345678', // Mock ID
                        server: testGame.servers ? testGame.servers[0].value : undefined
                    })

                    console.log('Topup Success:', topupRes.data.data)

                    const txnId = topupRes.data.data.transaction_id

                    // 5. Test Transaction Status
                    console.log(`\n--- Test: Transaction Status (${txnId}) ---`)
                    const txnRes = await client.get(`/transaction/${txnId}`)
                    console.log('Status:', txnRes.data.data)

                } catch (e: any) {
                    console.error('Topup Failed:', e.response?.data || e.message)
                }
            } else {
                console.log('No cheap game found for topup test.')
            }
        }

    } catch (e: any) {
        console.error('API Test Error:', e.response?.data || e.message)
    }

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
