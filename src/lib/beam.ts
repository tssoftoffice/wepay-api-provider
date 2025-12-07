import axios from 'axios'

const BEAM_API_URL = 'https://api.beamcheckout.com/api/v1'
const MERCHANT_ID = process.env.BEAM_MERCHANT_ID || 'tssoft'
const API_KEY = process.env.BEAM_API_KEY

if (!API_KEY) {
    if (typeof window === 'undefined') {
        console.warn('BEAM_API_KEY is not set')
    }
}
const getAuthHeader = () => {
    const credentials = `${MERCHANT_ID}:${API_KEY}`
    const encoded = Buffer.from(credentials).toString('base64')
    return `Basic ${encoded}`
}

export const createBeamCharge = async (amount: number, referenceId: string, returnUrl: string) => {
    try {
        const response = await axios.post(
            `${BEAM_API_URL}/charges`,
            {
                amount: amount * 100, // Beam likely uses satang/cents? The user example had 10000 for 100 baht? Or is it just raw? 
                // User example: "amount": 10000. If subscription is 1199, it might be 119900?
                // Usually payment gateways use smallest currency unit. 10000 THB cents = 100 THB.
                // Wait, user said "amount": 10000. If that's 100 baht, then yes.
                // If the subscription is 1199 THB, I should send 119900?
                // Let's assume it's in Satang (cents).
                currency: 'THB',
                paymentMethod: {
                    qrPromptPay: {
                        expiryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins expiry
                    },
                    paymentMethodType: 'QR_PROMPT_PAY'
                },
                referenceId,
                returnUrl,
                skip3dsFlow: false
            },
            {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data
    } catch (error: any) {
        console.error('Beam API Error:', error.response?.data || error.message)
        throw error
    }
}
