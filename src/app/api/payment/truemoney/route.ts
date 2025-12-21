import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { verifySlip } from '@/lib/slip-verification'
import { sendTelegramNotify } from '@/lib/telegram'
import { WePayClient } from '@/lib/wepay'
import { redeemTrueMoneyGift } from '@/lib/truemoney'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'PARTNER_OWNER') {
            return NextResponse.json({ error: 'Topup Failed', details: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { link } = body

        if (!link) {
            return NextResponse.json({ error: 'Topup Failed', details: 'กรุณากรอกลิงก์ซองของขวัญ' }, { status: 400 })
        }

        const userId = (session as any).userId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                partner: true
            }
        })

        if (!user || !user.partner) {
            return NextResponse.json({ error: 'Topup Failed', details: 'Partner account not found' }, { status: 404 })
        }

        // 1. Redeem Voucher (Using enhanced SSL/Proxy logic)
        // Mobile is required by API but might be optional/default internal
        // Using a placeholder mobile if strictly required by function signature, or user's mobile
        const tmMobile = process.env.TRUEMONEY_MOBILE || '0631140956'
        const redeemResult = await redeemTrueMoneyGift(link, tmMobile)

        if (!redeemResult.success || !redeemResult.amount) {
            return NextResponse.json({ error: 'Topup Failed', details: redeemResult.error || 'Redeem Failed' }, { status: 400 })
        }

        const amount = redeemResult.amount
        const transRef = link.split('v=')[1] || 'UNKNOWN_REF' // Use Code as Ref

        // 2. Check Duplicate Transaction
        const existingTxn = await prisma.partnerTopupTransaction.findFirst({
            where: { providerTxnId: transRef }
        })

        if (existingTxn) {
            return NextResponse.json({ error: 'Topup Failed', details: 'ซองนี้ถูกใช้ไปแล้ว' }, { status: 400 })
        }

        // 3. Calculate Fee (2.9%)
        const feePercent = 0.029
        const feeAmount = amount * feePercent
        const netAmount = amount - feeAmount

        // 4. Create Transaction & Update Wallet
        const txn = await prisma.$transaction(async (tx) => {
            const newTxn = await tx.partnerTopupTransaction.create({
                data: {
                    partnerId: user.partner!.id,
                    amount: netAmount,
                    status: 'SUCCESS',
                    providerTxnId: transRef,
                }
            })

            await tx.partner.update({
                where: { id: user.partner!.id },
                data: {
                    walletBalance: {
                        increment: netAmount
                    }
                }
            })

            // Audit Log
            await tx.auditLog.create({
                data: {
                    partnerId: user.partner!.id,
                    userId: userId,
                    action: 'TOPUP_TRUEMONEY_GIFT',
                    details: `Topup ${amount} (Fee ${feeAmount.toFixed(2)}) Net ${netAmount.toFixed(2)} Code: ${transRef}`
                }
            })

            return newTxn
        })

        // 5. Notifications
        sendTelegramNotify(
            `🎁 <b>เติมเงินสำเร็จ (TrueMoney Gift)</b>\n` +
            `ลูกค้า: ${user.partner!.name}\n` +
            `ยอดเงิน: <b>${amount.toLocaleString()} บาท</b>\n` +
            `หัก 2.9%: -${feeAmount.toFixed(2)} บาท\n` +
            `เข้ากระเป๋า: <b>${netAmount.toLocaleString()} บาท</b>\n` +
            `Code: ${transRef}\n` +
            `เวลา: ${new Date().toLocaleString('th-TH')}`
        ).catch(console.error)

        return NextResponse.json({
            success: true,
            transactionId: txn.id,
            amount: netAmount,
            message: 'เติมเงินสำเร็จ'
        })

    } catch (error: any) {
        console.error('TrueMoney API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
