import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createBeamCharge } from '@/lib/beam'
import { getAppUrl } from '@/lib/url'
import { sendTelegramNotify } from '@/lib/telegram'
import { verifySlip } from '@/lib/slip-verification'
import { WePayClient } from '@/lib/wepay'

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
        const verificationResult = await verifySlip(slipImage)

        if (!verificationResult) {
            return NextResponse.json({ error: 'ไม่สามารถตรวจสอบสลิปได้ หรือระบบตรวจสอบขัดข้อง' }, { status: 500 })
        }

        if (!verificationResult.success || !verificationResult.data) {
            return NextResponse.json({ error: verificationResult.error || 'สลิปไม่ถูกต้อง' }, { status: 400 })
        }

        const { receiverName, transRef, amount: slipAmount } = verificationResult.data

        // 2.1 Check Recipient Name
        // Note: RDCW may return truncated names like "บจก. ท" or "TSSOFT C"
        const validNames = ['TSSOFT CO.,LTD.', 'ทีเอสซอฟท์', 'Ts Soft', 'บริษัท ทีเอสซอฟท์ จำกัด', 'บจก. ทีเอสซอฟท์', 'TSSOFT', 'บจก. ท', 'TSSOFT C']
        const isValidReceiver = validNames.some(name => receiverName.toUpperCase().includes(name.toUpperCase()))

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

        // NOTE: Non-blocking notification to ensure fast response
        sendTelegramNotify(
            `🔔 <b>แจ้งเตือน Partner เติมเงิน</b>\n` +
            `ยอดเงิน: <b>${slipAmount.toLocaleString()} บาท</b>\n` +
            `เวลา: ${new Date().toLocaleString('th-TH')}`
        ).catch(err => console.error('Failed to send notification', err))

        // Check WePay Balance after top-up
        WePayClient.getBalance().then(async (balance) => {
            const LOW_BALANCE_THRESHOLD = 1000
            if (balance.available < LOW_BALANCE_THRESHOLD) {
                await sendTelegramNotify(
                    `⚠️ <b>แจ้งเตือนเงิน WePay ใกล้หมด</b>\n` +
                    `ยอดคงเหลือ: <b>${balance.available.toLocaleString()} บาท</b>\n` +
                    `กรุณาเติมเงินทันที`
                ).catch(console.error)
            }
        }).catch(e => console.error('Failed to check balance after partner topup', e))

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

// End of file
