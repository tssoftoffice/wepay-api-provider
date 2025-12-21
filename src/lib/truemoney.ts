import axios from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'

export async function redeemTrueMoneyGift(link: string, mobile: string) {
    try {
        if (!link || !mobile) {
            throw new Error('Link and Mobile are required')
        }

        // Extract code from link (e.g. https://gift.truemoney.com/campaign/?v=...)
        const codeMatch = link.match(/v=([a-zA-Z0-9]+)/)
        const code = codeMatch ? codeMatch[1] : null

        if (!code) {
            throw new Error('รูปแบบลิ้งค์ซองของขวัญไม่ถูกต้อง')
        }

        // ZMine API: https://zmine.me/api/giftvoucher/{code}/{mobile}/
        console.log(`Redeeming via ZMine: Code=${code}, Mobile=${mobile}`)

        const url = `https://zmine.me/api/giftvoucher/${code}/${mobile}/`

        // ZMine creates its own proxy/connection, so we don't need our own agent
        const response = await axios.get(url, {
            timeout: 20000 // Give them some time
        })

        const data = response.data

        // Handle ZMine Response Structure
        // Success: { "code": "200", "status": "success", "data": { "amount": ... } }
        // Error: { "code": "100"..."105", "status": "error", "message": "..." }

        const statusCode = String(data.code)

        if (statusCode === '200' && data.data) {
            return {
                success: true,
                amount: Number(data.data.amount)
            }
        }

        // Error Mapping
        const errorMsg = data.message || data.message_en || 'Unknown Error'

        // Map common codes for cleaner logs if needed, though 'message' is usually Thai friendly already
        if (statusCode === '100') return { success: false, error: 'ลิงค์ซองของขวัญถูกใช้งานแล้ว (Used)' }
        if (statusCode === '101') return { success: false, error: 'ลิงค์ซองของขวัญไม่ถูกต้อง (Invalid Link)' }
        if (statusCode === '102') return { success: false, error: 'ไม่สามารถรับซองของตัวเองได้ (Own Voucher)' }
        if (statusCode === '103') return { success: false, error: 'ซองนี้ต้องตั้งค่าให้รับได้เพียงคนเดียวเท่านั้น (One receiver only)' }
        if (statusCode === '105') return { success: false, error: 'ลิงก์ซองของขวัญหมดอายุ (Expired)' }

        // Fallback for other errors
        return { success: false, error: `Redeem Failed: ${errorMsg} (Code: ${statusCode})` }

    } catch (error: any) {
        console.error('ZMine API Error:', error.message)
        return { success: false, error: error.message || 'เชื่อมต่อ Server ยืนยันซองล้มเหลว' }
    }
}
