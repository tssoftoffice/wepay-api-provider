import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateApiKey } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await validateApiKey(req)

    if (auth.error) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const { partner } = auth

    // Find transaction ensuring it belongs to the partner
    const transaction = await prisma.gameTopupTransaction.findFirst({
        where: {
            id: id,
            partnerId: partner!.id
        },
        include: {
            game: {
                select: { name: true, code: true }
            }
        }
    })

    if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({
        data: {
            id: transaction.id,
            status: transaction.status,
            amount: Number(transaction.sellPrice),
            game: transaction.game.name,
            target_id: transaction.targetId,
            created_at: transaction.createdAt,
            details: transaction.providerTxnId
        }
    })
}
