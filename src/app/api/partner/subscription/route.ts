import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'PARTNER_OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { packageId } = await request.json()
        const userId = (session as any).userId

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true }
        })

        if (!user || !user.partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        const pkg = await prisma.subscriptionPackage.findUnique({
            where: { id: packageId }
        })

        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 })
        }

        // Create Subscription Transaction
        const txn = await prisma.subscriptionTransaction.create({
            data: {
                partnerId: user.partner.id,
                amount: pkg.price,
                status: 'PENDING',
            }
        })

        // Update Partner with selected package (pending)
        await prisma.partner.update({
            where: { id: user.partner.id },
            data: {
                packageId: pkg.id,
                subscriptionStatus: 'PENDING',
            }
        })

        // Mock Beam QR Code generation
        // In real world, we call Beam API here
        const beamQrUrl = `https://mock-beam.com/qr/${txn.id}?amount=${pkg.price}`

        return NextResponse.json({
            success: true,
            paymentUrl: beamQrUrl,
            transactionId: txn.id
        })

    } catch (error: any) {
        console.error('Subscription error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
