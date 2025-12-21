import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createBeamCharge } from '@/lib/beam'
import { getAppUrl } from '@/lib/url'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'PARTNER_OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { amount, slipImage } = body

        if (!slipImage) {
            return NextResponse.json({ error: 'กรุณาแนบสลิปโอนเงิน' }, { status: 400 })
        }

        const userId = (session as any).userId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true }
        })

        if (!user?.partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        // --- Slip Verification Logic ---
        let verificationResult = await verifySlipPrimary(slipImage)

        if (!verificationResult) {
            console.log('Primary slip verification failed, trying timeout/fallback...')
            // Try fallback
            verificationResult = await verifySlipSecondary(slipImage)
        }

        if (!verificationResult) {
            return NextResponse.json({ error: 'ไม่สามารถตรวจสอบสลิปได้ หรือระบบตรวจสอบสลิปขัดข้องชั่วคราว' }, { status: 500 })
        }

        if (!verificationResult.success) {
            return NextResponse.json({ error: verificationResult.error || 'สลิปไม่ถูกต้อง' }, { status: 400 })
        }

        const { sender, receiverName, transRef, amount: slipAmount } = verificationResult.data

        // 2.1 Check Recipient Name
        const validNames = ['TSSOFT CO.,LTD.', 'ทีเอสซอฟท์', 'Ts Soft', 'บริษัท ทีเอสซอฟท์ จำกัด']
        const isValidReceiver = validNames.some(name => receiverName.toUpperCase().includes(name.toUpperCase())) || receiverName.toUpperCase().includes('TSSOFT')

        if (!isValidReceiver) {
            return NextResponse.json({
                error: 'ชื่อบัญชีผู้รับเงินไม่ถูกต้อง (ต้องเป็น: TSSOFT CO.,LTD.)'
            }, { status: 400 })
        }

        // 2.2 Check Duplicate (TransRef)
        if (!transRef) {
            return NextResponse.json({ error: 'ไม่พบรหัสอ้างอิงในสลิป (Reference No.)' }, { status: 400 })
        }

        const existingTxn = await prisma.partnerTopupTransaction.findFirst({
            where: { providerTxnId: transRef }
        })

        if (existingTxn) {
            return NextResponse.json({ error: 'สลิปนี้ถูกใช้งานไปแล้ว' }, { status: 400 })
        }

        // 2.3 Check Amount
        if (slipAmount <= 0) {
            return NextResponse.json({ error: 'ยอดเงินในสลิปไม่ถูกต้อง' }, { status: 400 })
        }

        // 3. Create Transaction & Update Wallet
        const result = await prisma.$transaction(async (tx) => {
            // Create Transaction
            const newTxn = await tx.partnerTopupTransaction.create({
                data: {
                    partnerId: user.partner!.id,
                    amount: slipAmount,
                    status: 'SUCCESS', // Instant success
                    providerTxnId: transRef
                }
            })

            // Update Wallet
            await tx.partner.update({
                where: { id: user.partner!.id },
                data: {
                    walletBalance: {
                        increment: slipAmount
                    }
                }
            })

            // Create Audit Log
            await tx.auditLog.create({
                data: {
                    partnerId: user.partner!.id,
                    userId: userId,
                    action: 'TOPUP_SLIP',
                    details: `Topup ${slipAmount} via Slip ${transRef}`
                }
            })

            return newTxn
        })

        return NextResponse.json({
            success: true,
            transactionId: result.id,
            amount: slipAmount,
            message: 'เติมเงินสำเร็จ'
        })

    } catch (error: any) {
        console.error('Topup error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

// Helper types
type VerificationResult = {
    success: boolean
    error?: string
    data?: any
}

async function verifySlipPrimary(slipImage: string): Promise<VerificationResult | null> {
    try {
        console.log('Verifying slip with Primary...')
        const slipRes = await fetch('https://slip-s.oiio.download/api/slip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ img: slipImage })
        })

        if (!slipRes.ok) {
            const errText = await slipRes.text()
            console.error('Primary Slip API Error:', errText)
            return null // Return null to trigger fallback
        }

        const slipData = await slipRes.json()

        if (!slipData.success && !slipData.data) {
            return { success: false, error: 'สลิปไม่ถูกต้อง หรืออ่านข้อมูลไม่ได้ (Primary)' }
        }

        const data = slipData.data || slipData
        return {
            success: true,
            data: {
                receiverName: data.receiver_name || data.receiver?.displayName || '',
                transRef: data.ref || data.transRef || '',
                amount: Number(data.amount || 0),
                sender: data.sender // keep if needed
            }
        }
    } catch (error) {
        console.error('Primary Verify Error:', error)
        return null // Return null to trigger fallback
    }
}

async function verifySlipSecondary(slipImage: string): Promise<VerificationResult | null> {
    try {
        console.log('Verifying slip with Secondary (Slip2Go)...')
        const apiUrl = process.env.SLIP2GO_API_URL
        const secretKey = process.env.SLIP2GO_SECRET_KEY

        if (!apiUrl || !secretKey) {
            console.warn('SLIP2GO environment variables missing')
            return null
        }

        // Construct URL - handle potential trailing slash in env
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl

        // Try removing /api prefix defined in code if the user's url is likely the api root
        // If baseUrl is "https://api.slip2go.com", we probably want "https://api.slip2go.com/verify-slip..."
        // If baseUrl is "https://slip2go.com", we might want "https://slip2go.com/api/verify-slip..."
        // Safe bet: The user usually puts the ROOT domain. 
        // But previously we hardcoded `/api/...`.
        // Let's try to detect or just default to /verify-slip if using api subdomain, OR just rely on user provided path.

        // Let's try the path without /api first as per common convention for api subdomains
        const url = `${baseUrl}/verify-slip/qr-base64/info`


        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secretKey}`
            },
            body: JSON.stringify({
                payload: { imageBase64: slipImage }
            })
        })

        if (!res.ok) {
            const err = await res.text()
            console.error('Slip2Go Error:', err)
            return null
        }

        const json = await res.json()
        // Check Slip2Go response format
        // Based on docs/image: code="200000" means success
        if (json.code !== '200000') {
            return { success: false, error: json.message || 'สลิปไม่ถูกต้อง (Slip2Go)' }
        }

        const data = json.data
        const receiverAccount = data.receiver?.account || {}

        return {
            success: true,
            data: {
                receiverName: receiverAccount.name || '', // "บริษัท ทีเอสซอฟท์ จำกัด"
                transRef: data.transRef || '',
                amount: Number(data.amount || 0),
                sender: data.sender
            }
        }

    } catch (error) {
        console.error('Secondary Verify Error:', error)
        return null
    }
}
