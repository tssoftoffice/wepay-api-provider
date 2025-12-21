import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const username = process.env.WEPAY_USERNAME || ''
    const password = process.env.WEPAY_PASSWORD || ''

    // Helper to inspect string specifically for hidden chars
    const inspect = (str: string) => {
        if (!str) return 'MISSING/EMPTY'
        return {
            length: str.length,
            first_char: str.charAt(0),
            last_char: str.charAt(str.length - 1),
            first_code: str.charCodeAt(0),
            last_code: str.charCodeAt(str.length - 1),
            has_whitespace: /\s/.test(str),
            raw_preview: `${str.substring(0, 2)}***${str.substring(str.length - 2)}` // Show only start/end
        }
    }

    return NextResponse.json({
        status: 'CHECKING_CONFIG',
        env_check: {
            username: inspect(username),
            password: inspect(password),
            wepay_endpoint: process.env.WEPAY_ENDPOINT,
            wepay_proxy: process.env.WEPAY_PROXY_URL || 'NOT_SET'
        },
        message: "Check 'length' and 'has_whitespace'. If there are extra spaces or quotes (e.g. length is mismatch), your .env file is wrong."
    })
}
