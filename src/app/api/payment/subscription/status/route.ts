import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const transactionId = searchParams.get('transactionId')

        if (!transactionId) {
            return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })
        }

        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const transaction = await prisma.subscriptionTransaction.findUnique({
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
