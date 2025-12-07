import * as dotenv from 'dotenv'
dotenv.config()

async function main() {
    const { WePayClient } = await import('../src/lib/wepay')
    console.log('Testing WePay Connection via Proxy...')
    console.log('WEPAY_USERNAME:', process.env.WEPAY_USERNAME ? 'SET' : 'NOT SET')
    console.log('WEPAY_PROXY_URL:', process.env.WEPAY_PROXY_URL ? 'SET' : 'NOT SET')

    try {
        const balance = await WePayClient.getBalance()
        console.log('Connection Successful!')
        console.log('Ledger Balance:', balance.ledger)
        console.log('Available Balance:', balance.available)
    } catch (error: any) {
        console.error('Connection Failed:', error.message)
        if (error.response) {
            console.error('Response Status:', error.response.status)
            console.error('Response Data:', error.response.data)
        }
        if (error.cause) console.error('Cause:', error.cause)
    }
}

main()
