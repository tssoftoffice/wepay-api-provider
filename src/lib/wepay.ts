import axios from 'axios'
import FormData from 'form-data'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { getWePayErrorMessage } from './wepay-errors'

const WEPAY_ENDPOINT = process.env.WEPAY_ENDPOINT || 'https://www.wepay.in.th/client_api.json.php'
const USERNAME = process.env.WEPAY_USERNAME
const PASSWORD = process.env.WEPAY_PASSWORD
const CALLBACK_URL = process.env.WEPAY_CALLBACK_URL
const PROXY_URL = process.env.WEPAY_PROXY_URL

interface WePayResponse {
    code: string
    [key: string]: any
}

interface MakePaymentParams {
    destRef: string
    type: 'billpay' | 'mtopup' | 'cashcard' | 'gtopup'
    amount: number
    company: string
    ref1: string
    ref2?: string
    ref3?: string
    barcode?: string
}

export class WePayClient {
    private static async request(params: any): Promise<WePayResponse> {
        if (!USERNAME || !PASSWORD) {
            throw new Error('WePay credentials not configured')
        }

        const formData = new FormData()
        formData.append('username', USERNAME)
        formData.append('password', PASSWORD)

        Object.keys(params).forEach(key => {
            if (params[key] !== undefined) {
                formData.append(key, String(params[key])) // Ensure string conversation
            }
        })

        // Create a custom HTTPS Agent to handle legacy server compatibility
        const https = require('https')
        const httpsAgent = new https.Agent({
            // Allow legacy ciphers (Node 18+ defaults to OpenSSL 3 which is strict)
            ciphers: 'DEFAULT:@SECLEVEL=1',
            minVersion: 'TLSv1',
            rejectUnauthorized: false
        })

        const config: any = {
            headers: {
                ...formData.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            httpsAgent: httpsAgent
        }

        if (PROXY_URL) {
            // Note: If using Proxy, socks-proxy-agent handles the connection. 
            // We need to pass these SSL options to the proxy agent if possible, 
            // BUT socks-proxy-agent might override httpsAgent.
            // In Production, usually we DON'T use usage proxy (PROXY_URL is undefined).
            const agent = new SocksProxyAgent(PROXY_URL)
            config.httpsAgent = agent
            config.httpAgent = agent
        }

        try {
            const response = await axios.post(WEPAY_ENDPOINT, formData, config)
            return response.data
        } catch (error: any) {
            console.error('WePay Request Error:', error.message)
            if (error.response) {
                console.error('WePay Status:', error.response.status)
                console.error('WePay Data:', error.response.data)
            }
            throw error
        }
    }

    static async getBalance(): Promise<{ ledger: number, available: number }> {
        const res = await this.request({ type: 'balance_inquiry' })
        if (res.code !== '00000') {
            throw new Error(`WePay Balance Error: ${getWePayErrorMessage(res.code)}`)
        }
        return {
            ledger: Number(res.ledger_balance),
            available: Number(res.available_balance)
        }
    }

    static async makePayment(params: MakePaymentParams) {
        if (!CALLBACK_URL) {
            throw new Error('WEPAY_CALLBACK_URL not configured')
        }

        const payload = {
            type: params.type,
            dest_ref: params.destRef,
            resp_url: CALLBACK_URL,
            pay_to_amount: params.amount,
            pay_to_company: params.company,
            pay_to_ref1: params.ref1,
            pay_to_ref2: params.ref2,
            pay_to_ref3: params.ref3,
            pay_to_barcode1: params.barcode
        }

        const res = await this.request(payload)

        // Note: Code 00000 here means "Accepted for processing", not "Success"
        if (res.code !== '00000') {
            throw new Error(`WePay Payment Error: ${getWePayErrorMessage(res.code)}`)
        }

        return {
            billId: res.bill_id,
            transactionId: res.transaction_id,
            queueId: res.queue_id,
            totalAmount: res.total_amount,
            balance: res.balance,
            // Capture PIN/Serial if returned immediately
            pin: res.pin || res.card_pin || res.topup_code,
            serial: res.serial || res.serial_no
        }
    }

    static async getOutput(transactionId: string) {
        return this.request({
            type: 'get_output',
            transaction_id: transactionId
        })
    }

    static async getAvailableProducts(): Promise<any> {
        // This public endpoint provides the full list of products and denominations
        try {
            const response = await axios.get('https://www.wepay.in.th/comp_export.php?json')
            return response.data
        } catch (error: any) {
            console.error('Error fetching WePay products:', error.message)
            throw new Error('Failed to fetch WePay products')
        }
    }
}
