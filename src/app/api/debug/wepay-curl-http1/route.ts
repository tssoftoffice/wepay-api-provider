import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const WEPAY_ENDPOINT = process.env.WEPAY_ENDPOINT || 'https://www.wepay.in.th/client_api.json.php'
const USERNAME = process.env.WEPAY_USERNAME
const PASSWORD = process.env.WEPAY_PASSWORD

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Construct curl command FORCING HTTP/1.1
        const cmd = `curl --http1.1 -X POST ${WEPAY_ENDPOINT} -F "username=${USERNAME}" -F "password=${PASSWORD}" -F "type=balance_inquiry" -v`

        const { stdout, stderr } = await execAsync(cmd)

        return NextResponse.json({
            status: 'EXECUTED',
            protocol: 'HTTP/1.1',
            command: cmd.replace(PASSWORD || '', '***').replace(USERNAME || '', '***'),
            stdout,
            stderr
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'FAILED',
            error: error.message,
            stdout: error.stdout,
            stderr: error.stderr
        }, { status: 500 })
    }
}
