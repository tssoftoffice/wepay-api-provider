'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Get all partners for the list view
export async function getPartners(search?: string) {
    try {
        console.log('Fetching partners with search:', search)
        const where: any = {}
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { domain: { contains: search, mode: 'insensitive' } },
            ]
        }
        console.log('Query where:', JSON.stringify(where))

        const partners = await prisma.partner.findMany({
            where,
            include: {
                _count: {
                    select: {
                        users: true,
                        customers: true,
                        gameTopups: true // Total transactions
                    }
                },
                users: {
                    where: { role: 'PARTNER_OWNER' },
                    select: { email: true, phone: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        console.log('Partners found:', partners.length)

        // Serialize decimals
        const serializedPartners = partners.map(p => ({
            ...p,
            walletBalance: p.walletBalance.toNumber(),
        }))

        return { success: true, data: serializedPartners }
    } catch (error) {
        console.error('Error fetching partners:', error)
        return { success: false, error: `Failed to fetch partners: ${(error as Error).message}` }
    }
}

// Get single partner details
export async function getPartnerDetails(id: string) {
    try {
        console.log('Fetching partner details for ID:', id)
        const partner = await prisma.partner.findUnique({
            where: { id },
            include: {
                users: true,
                package: true,
                auditLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                userActivities: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                    include: { user: { select: { username: true } } }
                },
                partnerTopups: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                subscriptionTxns: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                _count: {
                    select: {
                        customers: true,
                        gameTopups: true
                    }
                }
            }
        })
        console.log('Partner details search result:', partner ? 'Found' : 'Not Found')

        if (!partner) return { success: false, error: 'Partner not found' }

        // Fetch recent transactions (Game Topups)
        const recentTransactions = await prisma.gameTopupTransaction.findMany({
            where: { partnerId: id },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                game: { select: { name: true } },
                customer: { select: { userId: true } }
            }
        })


        // Calculate detailed stats & Chart Data
        const allStatsTxns = await prisma.gameTopupTransaction.findMany({
            where: { partnerId: id, status: 'SUCCESS' },
            select: { createdAt: true, sellPrice: true, baseCost: true },
            orderBy: { createdAt: 'asc' }
        })

        let totalSalesVolume = 0
        let totalProfit = 0
        const dailyStats: Record<string, { date: string, sales: number, profit: number, count: number }> = {}

        for (const txn of allStatsTxns) {
            const sellPrice = txn.sellPrice.toNumber()
            const baseCost = txn.baseCost.toNumber()
            const profit = sellPrice - baseCost

            totalSalesVolume += sellPrice
            totalProfit += profit

            // Group by Date (Thai Time +7)
            const date = new Date(txn.createdAt.getTime() + (7 * 60 * 60 * 1000)).toISOString().split('T')[0]

            if (!dailyStats[date]) {
                dailyStats[date] = { date, sales: 0, profit: 0, count: 0 }
            }
            dailyStats[date].sales += sellPrice
            dailyStats[date].profit += profit
            dailyStats[date].count += 1
        }

        const chartData = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date))

        const totalTxns = await prisma.gameTopupTransaction.count({ where: { partnerId: id } })
        const successRate = totalTxns > 0 ? (allStatsTxns.length / totalTxns) * 100 : 0
        const lastActive = allStatsTxns.length > 0 ? allStatsTxns[allStatsTxns.length - 1].createdAt : null

        // Serialize decimals
        const serializedPartner = {
            ...partner,
            walletBalance: partner.walletBalance.toNumber(),
            stats: {
                totalSalesVolume: totalSalesVolume,
                totalProfit: totalProfit,
                lastActive: lastActive,
                successRate: Math.round(successRate)
            },
            chartData, // New Field
            recentTransactions: recentTransactions.map(txn => ({
                ...txn,
                baseCost: txn.baseCost.toNumber(),
                sellPrice: txn.sellPrice.toNumber(),
                providerPrice: txn.providerPrice.toNumber(),
            })),
            partnerTopups: partner.partnerTopups.map((t: any) => ({ ...t, amount: t.amount.toNumber() })),
            subscriptionTxns: partner.subscriptionTxns.map((t: any) => ({ ...t, amount: t.amount.toNumber() })),
        }

        return { success: true, data: serializedPartner }
    } catch (error) {
        console.error('Error fetching partner details:', error)
        return { success: false, error: 'Failed to fetch partner details' }
    }
}

// Update partner details
export async function updatePartner(id: string, data: { name: string, domain: string, subscriptionStatus: string, subscriptionEnd?: string }) {
    try {
        console.log('Updating partner:', id, data)
        await prisma.partner.update({
            where: { id },
            data: {
                name: data.name,
                domain: data.domain || null,
                subscriptionStatus: data.subscriptionStatus,
                subscriptionEnd: data.subscriptionEnd ? new Date(data.subscriptionEnd) : null
            }
        })

        await prisma.auditLog.create({
            data: {
                partnerId: id,
                action: 'UPDATE_SETTINGS',
                details: JSON.stringify(data)
            }
        })

        revalidatePath('/admin/partners/' + id)
        revalidatePath('/admin/partners')
        return { success: true }
    } catch (error) {
        console.error('Error updating partner:', error)
        return { success: false, error: 'Failed to update partner' }
    }
}

// Reset Partner User Password
export async function resetPartnerUserPassword(userId: string, newPassword: string) {
    try {
        console.log('Resetting password for user:', userId)

        // Dynamic import to avoid circular dependencies if auth.ts imports prisma too (though here it seems safe, assume hashPassword is pure)
        // If hashPassword is not exported, we might need to check lib/auth.ts again.
        // Wait, I checked lib/auth.ts and it exports hashPassword.
        const { hashPassword } = await import('@/lib/auth')

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { partnerId: true }
        })

        if (!user || !user.partnerId) {
            return { success: false, error: 'User or Partner not found' }
        }

        const hashedPassword = await hashPassword(newPassword)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        await prisma.auditLog.create({
            data: {
                action: 'RESET_PASSWORD',
                details: `Reset password for user ${userId}`,
                partnerId: user.partnerId
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error resetting password:', error)
        return { success: false, error: 'Failed to reset password' }
    }
}

// Adjust Partner Balance
export async function adjustPartnerBalance(partnerId: string, amount: number, note: string) {
    try {
        console.log('Adjusting balance for partner:', partnerId, amount, note)

        if (!amount || amount === 0) {
            return { success: false, error: 'Amount must be non-zero' }
        }

        if (!note) {
            return { success: false, error: 'Note is required' }
        }

        const partner = await prisma.partner.findUnique({ where: { id: partnerId } })
        if (!partner) return { success: false, error: 'Partner not found' }

        await prisma.$transaction(async (tx) => {
            // 1. Create Transaction (PartnerTopupTransaction)
            // We reuse PartnerTopupTransaction for simplicity, marking it as SUCCESS immediately
            // providerTxnId will store "ADMIN_ADJUSTMENT: <note>"
            await tx.partnerTopupTransaction.create({
                data: {
                    partnerId: partnerId,
                    amount: amount,
                    status: 'SUCCESS',
                    providerTxnId: `ADMIN: ${note}`
                }
            })

            // 2. Update Partner Balance
            const updateAction = amount > 0
                ? { increment: amount }
                : { decrement: Math.abs(amount) }

            await tx.partner.update({
                where: { id: partnerId },
                data: {
                    walletBalance: updateAction
                }
            })

            // 3. Audit Log
            await tx.auditLog.create({
                data: {
                    partnerId: partnerId,
                    action: 'ADMIN_ADJUST_BALANCE',
                    details: JSON.stringify({ amount, note })
                }
            })
        })

        revalidatePath('/admin/partners/' + partnerId)
        revalidatePath('/admin/partners')

        return { success: true }
    } catch (error: any) {
        console.error('Error adjusting balance:', error)
        return { success: false, error: error.message || 'Failed to adjust balance' }
    }
}
