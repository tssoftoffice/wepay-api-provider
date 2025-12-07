import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Simulating WePay Callback...')

    // 1. Find the latest transaction
    const txn = await prisma.gameTopupTransaction.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (!txn) {
        console.error('No transactions found in database.')
        console.log('Please make a topup request on the website first.')
        return
    }

    console.log(`Found latest transaction: ${txn.id}`)
    console.log(`Current Status: ${txn.status}`)

    if (txn.status !== 'PENDING') {
        console.log('Transaction is not PENDING. It might have failed or already succeeded.')
        console.log('If it FAILED, check the server logs for WePay error details.')
        // We can still try to simulate callback if user wants, but warn them
        console.log('Simulating callback anyway...')
    }

    // 2. Simulate Callback Request
    const callbackUrl = 'http://localhost:3000/api/wepay/callback'
    const payload = new FormData()
    payload.append('dest_ref', txn.id)
    payload.append('transaction_id', 'simulated-wepay-' + Date.now())
    payload.append('status', '2') // 2 = Success

    try {
        const response = await axios.post(callbackUrl, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        console.log('Callback Response:', response.data)

        // 3. Verify Status Update
        const updatedTxn = await prisma.gameTopupTransaction.findUnique({
            where: { id: txn.id }
        })

        if (updatedTxn?.status === 'SUCCESS') {
            console.log('SUCCESS: Transaction status updated to SUCCESS')
        } else {
            console.error('FAILED: Transaction status is ' + updatedTxn?.status)
        }

    } catch (error: any) {
        console.error('Callback Request Failed:', error.message)
        if (error.response) {
            console.error('Response Data:', error.response.data)
        }
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
