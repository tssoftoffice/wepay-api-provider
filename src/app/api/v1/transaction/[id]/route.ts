import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateApiKey } from '@/lib/api-auth'
import { WePayClient } from '@/lib/wepay'

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const auth = await validateApiKey(req)

    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = params

    if (!id) {
        return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    try {
        const transaction = await prisma.gameTopupTransaction.findUnique({
            where: { id },
            include: {
                game: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        })

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }

        // Security: Ensure the transaction belongs to the requesting partner
        if (transaction.partnerId !== auth.partner?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        let pin = transaction.pin
        let serial = transaction.serial

        // 3. Fallback: If PIN/Serial is missing AND we have a providerTxnId, try to fetch from WePay directly
        if ((!pin || !serial) && transaction.providerTxnId) {
            try {
                console.log(`Fetching missing PIN for ${transaction.id} (WePay Txn: ${transaction.providerTxnId})`)
                const wepayData = await WePayClient.getOutput(transaction.providerTxnId)
                // console.log('WePay Fallback Response:', JSON.stringify(wepayData, null, 2)) 

                let foundPin = wepayData.pin || wepayData.card_pin || wepayData.topup_code
                let foundSerial = wepayData.serial || wepayData.serial_no

                // Handle 'output' string parsing (WePay legacy format)
                // Example: "dest_ref=...&cashcard_ref1=SERIAL&cashcard_ref2=PIN..."
                if (!foundPin && typeof wepayData.output === 'string') {
                    try {
                        const params = new URLSearchParams(wepayData.output)
                        foundPin = params.get('cashcard_ref2') || params.get('pin') || params.get('password')
                        foundSerial = params.get('cashcard_ref1') || params.get('serial_no')
                    } catch (e) {
                        console.error('Error parsing WePay output string:', e)
                    }
                }

                if (foundPin || foundSerial) {
                    // Update Database
                    await prisma.gameTopupTransaction.update({
                        where: { id: transaction.id },
                        data: {
                            pin: foundPin ? String(foundPin) : undefined,
                            serial: foundSerial ? String(foundSerial) : undefined,
                            status: 'SUCCESS' // Confirm success if we found data
                        }
                    })

                    // Update local variables for response
                    if (foundPin) pin = String(foundPin)
                    if (foundSerial) serial = String(foundSerial)
                }
            } catch (err) {
                console.error('Failed to auto-fetch PIN from WePay:', err)
                // Ignore error, just return what we have
            }
        }

        return NextResponse.json({
            data: {
                transaction_id: transaction.id,
                status: transaction.status,
                game_name: transaction.game.name,
                target_id: transaction.targetId,
                amount: Number(transaction.baseCost),
                pin: pin,
                serial: serial,
                created_at: transaction.createdAt
            }
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Internal Server Error'
            }
        }, { status: 500 })
    }
}
