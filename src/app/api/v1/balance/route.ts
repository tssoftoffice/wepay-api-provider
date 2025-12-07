import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
    const auth = await validateApiKey(req)

    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { partner } = auth

    return NextResponse.json({
        data: {
            partner_name: partner!.name,
            wallet_balance: Number(partner!.walletBalance),
            currency: 'THB'
        }
    })
}
