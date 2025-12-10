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

        const userId = (session as any).userId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true }
        })

        if (!user?.partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        const body = await request.json()
        const { planId } = body

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
        }

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        })

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }

        const amount = Number(plan.price)

        // Create Transaction Record
        const transaction = await prisma.subscriptionTransaction.create({
            data: {
                partnerId: user.partner.id,
                planId: plan.id,
                amount: amount,
                status: 'PENDING',
            }
        })

        // Call Beam API
        // Use transaction ID as reference
        const beamResponse = await createBeamCharge(
            amount,
            transaction.id,
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/partner/subscription/success`
        )

        const qrImage = beamResponse.encodedImage?.imageBase64Encoded
            ? `data:image/png;base64,${beamResponse.encodedImage.imageBase64Encoded}`
            : null

        return NextResponse.json({
            success: true,
            qrImage: qrImage,
            transactionId: transaction.id
        })

    } catch (error: any) {
        console.error('Payment creation failed:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
