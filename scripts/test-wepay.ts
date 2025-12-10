const { WePayClient } = require('../src/lib/wepay') // Adjust path if needed, but ts-node might need src input
// Actually better to use the relative path that works with ts-node or just modify the existing file.
// Let's rely on standard ts-node execution.

// Since we can't easily import TS classes in a JS script without compilation or ts-node registration,
// I will create this as a .ts file and expect the user to run it with ts-node or next's runner.
// But wait, the previous scripts were .js ... ah, `seed-plans.js`, `reset-sub.js`.
// And they used `require('@prisma/client')` which is pre-compiled.
// My `WePayClient` is source code.

// I'll assume I can run it via `npx ts-node` with `tsconfig.json` support.

import { WePayClient } from '../src/lib/wepay'
import dotenv from 'dotenv'
dotenv.config()

async function main() {
    console.log('Testing WePay Connection...')
    try {
        const balance = await WePayClient.getBalance()
        console.log('✅ Connection Success!')
        console.log('Ledger Balance:', balance.ledger)
        console.log('Available Balance:', balance.available)
    } catch (error: any) {
        console.error('❌ Connection Failed!')
        console.error('Error Message:', error.message)
        if (error.response) {
            console.error('Status:', error.response.status)
            console.error('Data:', JSON.stringify(error.response.data, null, 2))
        }
    }
}

main()
