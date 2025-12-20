import { NextResponse } from 'next/server'
import { WePayClient } from '@/lib/wepay'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Attempt to connect to WePay (Check Balance)
        // This runs FROM THE SERVER, so it uses the Server's IP
        const balance = await WePayClient.getBalance()

        return NextResponse.json({
            status: 'SUCCESS',
            message: 'Connection Successful! Your Server IP is ALLOWED.',
            data: balance
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'FAILED',
            message: 'Connection Failed.',
            error_message: error.message,
            // If WePay returns error details (like IP not allowed), it will show here
            wepay_response: error.response?.data || 'No response from WePay',
            server_time: new Date().toISOString()
        }, { status: 500 })
    }
}
