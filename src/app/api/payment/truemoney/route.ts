import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendTelegramNotify } from '@/lib/telegram'
import { redeemTrueMoneyGift } from '@/lib/truemoney'
import { WePayClient } from '@/lib/wepay'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'PARTNER_OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { link } = body

        if (!link) {
            return NextResponse.json({ error: 'กรุณาระบุลิ้งค์ซองของขวัญ' }, { status: 400 })
        }

        const userId = (session as any).userId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true }
        })

        if (!user?.partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        // 1. Redeem Gift
        const mobile = process.env.TRUEMONEY_MOBILE
        if (!mobile) {
            console.error('TRUEMONEY_MOBILE is not set in .env')
            return NextResponse.json({ error: 'ระบบยังไม่พร้อมใช้งาน (Missing Config)' }, { status: 500 })
        }

        const result = await redeemTrueMoneyGift(link, mobile)

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'เติมเงินไม่สำเร็จ' }, { status: 400 })
        }

        const fullAmount = result.amount || 0

        // 2. Check Amount (Min 10 THB)
        if (fullAmount < 10) {
            return NextResponse.json({ error: 'ยอดเงินต่ำกว่าขั้นต่ำ 10 บาท' }, { status: 400 })
        }

        // 3. Calculate Fee (2.9%)
        const feePercent = 0.029
        const feeAmount = fullAmount * feePercent
        const netAmount = fullAmount - feeAmount

        // 4. Create Transaction & Update Wallet
        const txn = await prisma.$transaction(async (tx) => {
            // Create Transaction
            const newTxn = await tx.partnerTopupTransaction.create({
                data: {
                    partnerId: user.partner!.id,
                    amount: netAmount, // Record Net Amount
                    status: 'SUCCESS',
                    providerTxnId: `TM-${Date.now()}`,
                }
            })

            // Update Wallet
            await tx.partner.update({
                where: { id: user.partner!.id },
                data: {
                    walletBalance: {
                        increment: netAmount
                    }
                }
            })

            // Audit
            await tx.auditLog.create({
                data: {
                    partnerId: user.partner!.id,
                    userId: userId,
                    action: 'TOPUP_TRUEMONEY',
                    details: `Topup ${fullAmount} (Fee ${feeAmount.toFixed(2)}) Net ${netAmount.toFixed(2)} via TrueMoney`
                }
            })

            return newTxn
        })

        // 5. Notifications
        sendTelegramNotify(
            `🧧 <b>แจ้งเตือน Partner เติมเงิน (TrueMoney)</b>\n` +
            `ลูกค้า: ${user.partner!.name || 'ไม่ระบุ'}\n` +
            `ยอดซอง: <b>${fullAmount.toLocaleString()} บาท</b>\n` +
            `ค่าธรรมเนียม: ${feeAmount.toFixed(2)} บาท (2.9%)\n` +
            `ได้รับจริง: <b>${netAmount.toLocaleString()} บาท</b>\n` +
            `เวลา: ${new Date().toLocaleString('th-TH')}`
        ).catch(err => console.error('Failed to send notification', err))

        // Check WePay Balance
        WePayClient.getBalance().then(async (balance) => {
            if (balance.available < 1000) {
                await sendTelegramNotify(
                    `⚠️ <b>แจ้งเตือนเงิน WePay ใกล้หมด</b>\n` +
                    `ยอดคงเหลือ: <b>${balance.available.toLocaleString()} บาท</b>\n` +
                    `กรุณาเติมเงินทันที`
                ).catch(console.error)
            }
        }).catch(err => console.error('Failed to check balance', err))

        return NextResponse.json({
            success: true,
            transactionId: txn.id,
            amount: netAmount,
            message: 'เติมเงินสำเร็จ'
        })

    } catch (error: any) {
        console.error('TrueMoney Topup Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
