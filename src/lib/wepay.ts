import axios from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'

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
    type: 'billpay' | 'mtopup' | 'cashcard'
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
                formData.append(key, params[key])
            }
        })

        const config: any = {
            headers: { 'Content-Type': 'multipart/form-data' }
        }

        if (PROXY_URL) {
            const agent = new SocksProxyAgent(PROXY_URL)
            config.httpsAgent = agent
            config.httpAgent = agent
        }

        try {
            const response = await axios.post(WEPAY_ENDPOINT, formData, config)
            return response.data
        } catch (error) {
            console.error('WePay Request Error:', error)
            throw error
        }
    }

    static async getBalance(): Promise<{ ledger: number, available: number }> {
        const res = await this.request({ type: 'balance_inquiry' })
        if (res.code !== '00000') {
            throw new Error(`WePay Balance Error: ${res.code}`)
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
            throw new Error(`WePay Payment Error: ${res.code}`)
        }

        return {
            billId: res.bill_id,
            transactionId: res.transaction_id,
            queueId: res.queue_id,
            totalAmount: res.total_amount,
            balance: res.balance
        }
    }

    static async getOutput(transactionId: string) {
        return this.request({
            type: 'get_output',
            transaction_id: transactionId
        })
    }
}
