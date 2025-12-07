import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
        return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })
    }

    try {
        const transaction = await prisma.partnerTopupTransaction.findUnique({
            where: { id: transactionId },
            select: { status: true }
        })

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }

        return NextResponse.json({ status: transaction.status })

    } catch (error) {
        console.error('Status check error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
