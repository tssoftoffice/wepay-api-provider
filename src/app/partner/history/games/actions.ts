'use server'

import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface GetGameTransactionsParams {
    page: number
    pageSize: number
    sortField: string
    sortOrder: 'asc' | 'desc'
}

export async function getGameTransactions({
    page = 1,
    pageSize = 20,
    sortField = 'createdAt',
    sortOrder = 'desc'
}: GetGameTransactionsParams) {
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') {
        return { success: false, error: 'Unauthorized' }
    }

    const userId = (session as any).userId
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { partner: true }
    })

    if (!user?.partner) {
        return { success: false, error: 'Partner not found' }
    }

    try {
        const partnerId = user.partner.id

        // Validate sort field to prevent injection/errors
        const validSortFields = ['createdAt', 'sellPrice', 'status']
        const field = validSortFields.includes(sortField) ? sortField : 'createdAt'
        const order = sortOrder === 'asc' ? 'asc' : 'desc'

        const orderBy = { [field]: order }

        const skip = (page - 1) * pageSize

        const [total, transactions] = await Promise.all([
            prisma.gameTopupTransaction.count({
                where: { partnerId }
            }),
            prisma.gameTopupTransaction.findMany({
                where: { partnerId },
                orderBy: orderBy as any,
                skip,
                take: pageSize,
                include: {
                    game: {
                        select: { name: true, code: true }
                    }
                }
            })
        ])

        return {
            success: true,
            data: transactions.map(tx => ({
                id: tx.id,
                transactionId: tx.providerTxnId,
                createdAt: tx.createdAt,
                status: tx.status,
                baseCost: Number(tx.baseCost), // Added for profit calculation
                sellPrice: Number(tx.sellPrice),
                targetId: tx.targetId,
                game: tx.game
            })),
            total,
            totalPages: Math.ceil(total / pageSize)
        }

    } catch (error) {
        console.error("Error fetching history:", error)
        return { success: false, error: 'Failed to fetch history' }
    }
}
