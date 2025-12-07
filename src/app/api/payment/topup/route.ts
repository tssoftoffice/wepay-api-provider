import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createBeamCharge } from '@/lib/beam'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'PARTNER_OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { amount } = body

        if (!amount || amount < 1) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        const userId = (session as any).userId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true }
        })

        if (!user?.partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        // Create Pending Transaction
        const transaction = await prisma.partnerTopupTransaction.create({
            data: {
                partnerId: user.partner.id,
                amount: amount,
                status: 'PENDING'
            }
        })

        // Call Beam API
        // Beam expects amount in THB (lib handles conversion)
        const beamCharge = await createBeamCharge(
            amount,
            transaction.id,
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/partner/topup`
        )

        if (!beamCharge) {
            return NextResponse.json({ error: 'Failed to create Beam charge' }, { status: 500 })
        }

        // Extract QR Code (Base64)
        // The Beam API returns `encodedImage` which contains `imageBase64Encoded`
        // We need to format it as a data URI
        let qrImage = ''
        if (beamCharge.encodedImage && beamCharge.encodedImage.imageBase64Encoded) {
            qrImage = `data:image/png;base64,${beamCharge.encodedImage.imageBase64Encoded}`
        }

        return NextResponse.json({
            success: true,
            transactionId: transaction.id,
            qrImage: qrImage
        })

    } catch (error) {
        console.error('Topup error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
