import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { randomBytes } from 'crypto'

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

        // Generate Keys
        const apiKey = `pk_${randomBytes(16).toString('hex')}`
        const secretKey = `sk_${randomBytes(32).toString('hex')}`

        // Update Partner
        const updatedPartner = await prisma.partner.update({
            where: { id: user.partner.id },
            data: {
                apiKey,
                secretKey
            }
        })

        return NextResponse.json({
            success: true,
            apiKey: updatedPartner.apiKey,
            secretKey: updatedPartner.secretKey
        })

    } catch (error: any) {
        console.error('Key generation error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
