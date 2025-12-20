import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()

        return NextResponse.json({
            node_process_ip: data.ip,
            message: 'This is the IP address that the Node.js application uses correctly.'
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
