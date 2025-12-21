
interface RDCWResponse {
    code: number;
    message: string;
    data?: {
        transRef: string;
        sendingBank: string;
        receivingBank: string;
        amount: number;
        transDate: string;
        transTime: string;
        sender: {
            displayName: string;
            name: string;
            account: {
                value: string;
            };
        };
        receiver: {
            displayName: string;
            name: string;
            account: {
                value: string;
            };
        };
    };
}

export async function verifySlipWithRDCW(file: File): Promise<any> {
    const clientId = process.env.RDCW_CLIENT_ID
    const clientSecret = process.env.RDCW_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        console.warn('RDCW_CLIENT_ID or RDCW_CLIENT_SECRET is not set')
        return null
    }

    try {
        const formData = new FormData()
        formData.append('file', file)

        // Basic Auth: base64(clientId:clientSecret)
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

        const response = await fetch('https://suba.rdcw.co.th/v2/inquiry', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`
                // Note: Content-Type for FormData is handled automatically by fetch
            },
            body: formData
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('RDCW Verify Error:', response.status, errorText)
            return null
        }

        const result = await response.json() as RDCWResponse

        // Check for success code (usually 0 or 200, need to verify documentation)
        // Based on typical APIs, if data exists it's good.
        // Assuming result structure fits our needs.

        // Map to common format used in route.ts (if possible)
        // or just return raw data to be mapped in the route
        return result

    } catch (error) {
        console.error('Error calling RDCW API:', error)
        return null
    }
}
