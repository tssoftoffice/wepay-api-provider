
/**
 * TrueMoney Gift (AngPao) Helper
 */

interface RedeemResponse {
    status: {
        code: string;
        message: string;
    };
    data?: {
        my_ticket: {
            amount_baht: string;
        };
        tickets: {
            mobile: string;
        }[];
    };
}

export async function redeemTrueMoneyGift(giftLink: string, mobileNumber: string): Promise<{ success: boolean; amount?: number; error?: string }> {
    try {
        // 1. Extract Voucher Hash
        // Format: https://gift.truemoney.com/campaign/?v=xxxxxxxx
        const url = new URL(giftLink);
        const voucherHash = url.searchParams.get('v');

        if (!voucherHash || !giftLink.includes('gift.truemoney.com')) {
            return { success: false, error: 'ลิ้งค์ซองของขวัญไม่ถูกต้อง (Invalid Gift Link)' };
        }

        if (!mobileNumber) {
            return { success: false, error: 'เบอร์รับเงินไม่ถูกต้อง (Invalid Mobile Number)' };
        }

        // 2. Redeem API
        // Use axios for better header control and potentially different TLS behavior
        const axios = require('axios');

        try {
            const response = await axios.post(`https://gift.truemoney.com/campaign/v1/redeem`, {
                mobile: mobileNumber,
                voucher_hash: voucherHash
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                    'Accept': 'application/json',
                    'Origin': 'https://gift.truemoney.com',
                    'Referer': 'https://gift.truemoney.com/campaign/?v=' + voucherHash
                },
                timeout: 10000
            });

            // Axios throws on 4xx/5xx by default, so if we get here, it's 2xx
            const json = response.data as RedeemResponse;

            // 3. Check Response Code
            if (json.status.code === 'SUCCESS') {
                const amount = parseFloat(json.data?.my_ticket.amount_baht || '0');
                return { success: true, amount };
            } else {
                let errorMsg = 'ซองของขวัญใช้ไม่ได้';
                const code = json.status.code;

                if (code === 'VOUCHER_OUT_OF_STOCK') errorMsg = 'ซองนี้ถูกรับไปหมดแล้ว';
                else if (code === 'VOUCHER_NOT_FOUND') errorMsg = 'ไม่พบซองของขวัญนี้';
                else if (code === 'VOUCHER_EXPIRED') errorMsg = 'ซองหมดอายุแล้ว';
                else if (code === 'TARGET_USER_REDEEMED') errorMsg = 'คุณได้รับซองนี้ไปแล้ว';
                else if (code === 'CANNOT_GET_OWN_VOUCHER') errorMsg = 'ไม่สามารถรับซองของตัวเองได้';

                return { success: false, error: `${errorMsg} (${code})` };
            }

        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                console.error('TrueMoney API Error:', status);
                return { success: false, error: `เชื่อมต่อ TrueMoney ล้มเหลว (${status}) - อาจเกิดจาก IP ถูกบล็อก` };
            }
            throw error;
        }

    } catch (error: any) {
        console.error('Redeem Exception:', error);
        return { success: false, error: error.message || 'Server Error' };
    }
}
