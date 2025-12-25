import { verifySlipWithRDCW } from '@/lib/rdcw'

export type VerificationResult = {
    success: boolean
    error?: string
    data?: VerificationData
}

export type VerificationData = {
    receiverName: string
    transRef: string
    amount: number
    sender?: any
}

/**
 * Main function to verify slip using multiple providers (fallback strategy)
 * 1. EasySlip (Primary)
 * 2. Slip2Go (Secondary)
 * 3. RDCW (Tertiary)
 */
export async function verifySlip(slipImage: string): Promise<VerificationResult> {
    const errors: string[] = []

    // 1. Primary (Disabled 404)
    /*
    let result = await verifySlipPrimary(slipImage)
    if (result && result.success) return result
    if (result?.error) errors.push(`Primary: ${result.error}`)
    */
    let result: any = null // Placeholder

    // 2. Secondary (Slip2Go) - Enabled for TrueMoney support
    console.log('Primary fail/disabled, trying Secondary (Slip2Go)...')
    result = await verifySlipSecondary(slipImage)
    if (result && result.success) return result
    if (result?.error) errors.push(`Slip2Go: ${result.error}`)

    // 3. Tertiary
    console.log('Secondary fail, trying Tertiary (RDCW)...')
    result = await verifySlipTertiary(slipImage)
    if (result && result.success) return result
    if (result?.error) errors.push(`RDCW: ${result.error}`)

    return {
        success: false,
        error: `All providers failed. Details: ${errors.join(', ') || 'Unknown error'}`
    }
}

// --- Providers ---

async function verifySlipPrimary(slipImage: string): Promise<VerificationResult | null> {
    // ... (Keep existing implementation or leave as is if not changing)
    // For brevity, assuming this valid code exists above or is being replaced if inside the block
    return { success: false, error: 'Disabled' }
}

async function verifySlipSecondary(slipImage: string): Promise<VerificationResult | null> {
    try {
        console.log('Verifying slip with Secondary (Slip2Go)...')

        // Endpoint requested by User
        // Endpoint requested by User
        const apiUrl = process.env.SLIP2GO_API_URL || 'https://connect.slip2go.com/api/verify-slip/qr-base64/info'
        const apiKey = process.env.SLIP2GO_API_KEY

        if (!apiKey) {
            console.error('Missing SLIP2GO_API_KEY in .env')
            return { success: false, error: 'Server Configuration Error (Missing Slip2Go Key)' }
        }

        // User confirmed API expects full "data:image/..." format
        // So we do NOT strip the header anymore.

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Switched back to Bearer
            },
            body: JSON.stringify({
                // Error "payload.imageBase64 should not be empty" confirms the key
                payload: {
                    imageBase64: slipImage // Send full string
                }
            })
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error(`Slip2Go Error (${res.status}):`, errText)
            return { success: false, error: `Slip2Go HTTP ${res.status}: ${errText}` }
        }

        const json = await res.json()

        // Handle specific Slip2Go errors
        if (json.code === '200500' || json.message?.includes('fraud')) {
            console.warn('Slip2Go Fraud Detection:', json)
            return { success: false, error: 'สลิปไม่ถูกต้อง หรือถูกปลอมแปลง (Slip detected as fraud)' }
        }

        if ((json.status && json.status !== 200) || (json.success === false)) {
            console.error('Slip2Go Output:', JSON.stringify(json))
            return { success: false, error: json.message || 'Slip2Go Verification Failed' }
        }

        console.log('Slip2Go Valid Response:', JSON.stringify(json)) // Debug Receiver Name

        const data = json.data || json

        // Final check for valid data
        if (!data.amount) {
            return { success: false, error: 'ไม่พบยอดเงินในสลิป (No amount found)' }
        }

        return {
            success: true,
            data: {
                receiverName: data.receiver_name || data.receiver?.account?.name || data.receiver?.displayName || data.receiver?.name || '',
                transRef: data.transRef || data.ref || data.transaction_reference_id || '',
                amount: Number(data.amount),
                sender: data.sender
            }
        }

    } catch (error: any) {
        console.error('Slip2Go Exception:', error)
        return { success: false, error: error.message }
    }
}

async function verifySlipTertiary(slipImage: string): Promise<VerificationResult | null> {
    try {
        console.log('Verifying slip with Tertiary (RDCW)...')

        // Base64 -> Buffer
        // Format: data:image/jpeg;base64,....
        const matches = slipImage.match(/^data:(.+);base64,(.+)$/)
        if (!matches) {
            return { success: false, error: 'Invalid Base64 Image Format' }
        }

        const mimeType = matches[1] // e.g., image/jpeg or image/png
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')
        const extension = mimeType.split('/')[1] || 'jpg'
        const filename = `slip.${extension}`

        const rdcwRes = await verifySlipWithRDCW(buffer, filename, mimeType)

        if (!rdcwRes.success) {
            return { success: false, error: rdcwRes.error || 'RDCW Verification Failed' }
        }

        const data = rdcwRes.data
        if (!data) return { success: false, error: 'RDCW: No data returned' }

        return {
            success: true,
            data: {
                receiverName: data.receiver?.displayName || data.receiver?.name || '',
                transRef: data.transRef || '',
                amount: Number(data.amount || 0),
                sender: data.sender
            }
        }
    } catch (error: any) {
        console.error('Tertiary Verify Error:', error)
        return { success: false, error: error.message }
    }
}
