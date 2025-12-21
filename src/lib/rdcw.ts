import FormData from 'form-data'


interface RDCWResponse {
    code: number;
    message: string;
    data?: any;
}

export async function verifySlipWithRDCW(fileBuffer: Buffer, filename: string = 'slip.jpg', mimeType: string = 'image/jpeg'): Promise<any> {
    const clientId = process.env.RDCW_CLIENT_ID
    const clientSecret = process.env.RDCW_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        console.warn('RDCW_CLIENT_ID or RDCW_CLIENT_SECRET is not set')
        return null
    }

    try {
        console.log(`Sending to RDCW: Size=${fileBuffer.length} bytes, Type=${mimeType}, Name=${filename}`)

        const data = new FormData()
        // form-data library requires options object for Buffer to set filename/type correctly
        data.append('file', fileBuffer, {
            filename: filename,
            contentType: mimeType,
            knownLength: fileBuffer.length
        })

        // Basic Auth: base64(clientId:clientSecret)
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

        // Debug Headers
        const headers = data.getHeaders()
        console.log('RDCW Request Headers:', JSON.stringify(headers))

        const response = await fetch('https://suba.rdcw.co.th/v2/inquiry', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                ...headers
            },
            body: data as any // Cast to any because node-fetch body types might differ slightly in strict TS
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('RDCW Verify Error (Fetch):', response.status, errorText)
            return { success: false, error: `RDCW ${response.status}: ${errorText}` }
        }

        const result = await response.json() as RDCWResponse
        return { success: true, data: result.data || result }

    } catch (error: any) {
        console.error('Error calling RDCW API:', error)
        return { success: false, error: `RDCW Exception: ${error.message}` }
    }
}
