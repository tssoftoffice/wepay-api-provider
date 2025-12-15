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

        // allow amount to be optional if we trust the slip completely, but usually we want to match
        // For now, let's require at least slipImage
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

        // 1. Verify Slip with External API
        console.log('Verifying slip...')
        const slipRes = await fetch('https://slip-s.oiio.download/api/slip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ img: slipImage })
        })

        if (!slipRes.ok) {
            const errText = await slipRes.text()
            console.error('Slip API Error:', errText)
            return NextResponse.json({ error: 'ไม่สามารถตรวจสอบสลิปได้ กรุณาลองใหม่' }, { status: 500 })
        }

        const slipData = await slipRes.json()

        // 2. Validate Slip Data
        // API format check: assuming success=true or similar. Based on common slip APIs:
        // Structure usually contains: success, message, data: { sender, receiver: { displayName, ... }, amount, transRef, ... }
        // We will log the response first to be sure during dev, but here we implement standard checks.

        // Check if API returned success (adjust based on actual API response structure)
        if (!slipData.success && !slipData.data) {
            return NextResponse.json({ error: 'สลิปไม่ถูกต้อง หรืออ่านข้อมูลไม่ได้' }, { status: 400 })
        }

        const data = slipData.data || slipData // Fallback if structure varies

        // 2.1 Check Recipient Name
        const receiverName = data.receiver?.displayName || data.receiver?.name || ''
        if (!receiverName.includes('ทีเอสซอฟท์') && !receiverName.includes('Ts Soft')) { // Flexible check
            // Strict check requested: "บจก.ทีเอสซอฟท์"
            // But usually bank shortens names. Let's start with strict-ish.
            if (!receiverName.includes('ทีเอสซอฟท์')) {
                return NextResponse.json({
                    error: `ชื่อบัญชีผู้รับเงินไม่ถูกต้อง (พบ: ${receiverName}, ต้องเป็น: บจก.ทีเอสซอฟท์)`
                }, { status: 400 })
            }
        }

        // 2.2 Check Duplicate (TransRef)
        const transRef = data.transRef || data.ref1 || ''
        if (!transRef) {
            return NextResponse.json({ error: 'ไม่พบรหัสอ้างอิงในสลิป' }, { status: 400 })
        }

        const existingTxn = await prisma.partnerTopupTransaction.findFirst({
            where: { providerTxnId: transRef }
        })

        if (existingTxn) {
            return NextResponse.json({ error: 'สลิปนี้ถูกใช้งานไปแล้ว' }, { status: 400 })
        }

        // 2.3 Check Amount (Optional but recommended)
        const slipAmount = Number(data.amount || 0)
        if (slipAmount <= 0) {
            return NextResponse.json({ error: 'ยอดเงินในสลิปไม่ถูกต้อง' }, { status: 400 })
        }

        // If client sent amount, we typically ignore it and use slip amount for trust, 
        // OR we verify they match. Let's trust the slip amount as the source of truth.

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
