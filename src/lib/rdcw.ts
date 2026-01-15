import axios from 'axios'
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
        console.log(`Sending to RDCW (Axios): Size=${fileBuffer.length} bytes, Type=${mimeType}, Name=${filename}`)

        const data = new FormData()
        data.append('file', fileBuffer, {
            filename: filename,
            contentType: mimeType,
            knownLength: fileBuffer.length
        })

        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

        const response = await axios.post('https://suba.rdcw.co.th/v2/inquiry', data, {
            headers: {
                'Authorization': `Basic ${auth}`,
                ...data.getHeaders()
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        })

        const result = response.data as RDCWResponse

        console.log('Full RDCW Response Data:', JSON.stringify(result, null, 2))

        // Check if structure matches expectation
        if (typeof result.code === 'undefined') {
            return { success: false, error: `RDCW Invalid Response Structure: ${JSON.stringify(result)}` }
        }

        // RDCW sometimes returns 200 OK but with logic error code
        if (result.code !== 0 && result.code !== 200) {
            console.log('RDCW Response:', JSON.stringify(result))
            return { success: false, error: `RDCW Error (${result.code}): ${result.message}` }
        }

        return { success: true, data: result.data || result }

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('RDCW Axios Error:', error.response?.status, error.response?.data)
            return { success: false, error: `RDCW HTTP ${error.response?.status}: ${JSON.stringify(error.response?.data)}` }
        }
        console.error('Error calling RDCW API:', error)
        return { success: false, error: `RDCW Exception: ${error.message}` }
    }
}
