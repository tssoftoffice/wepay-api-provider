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

        // Calculate detailed stats
        const stats = await prisma.gameTopupTransaction.aggregate({
            where: { partnerId: id, status: 'SUCCESS' },
            _sum: { sellPrice: true },
            _max: { createdAt: true }
        })

        const totalTxns = await prisma.gameTopupTransaction.count({ where: { partnerId: id } })
        const successTxns = await prisma.gameTopupTransaction.count({ where: { partnerId: id, status: 'SUCCESS' } })
        const successRate = totalTxns > 0 ? (successTxns / totalTxns) * 100 : 0

        // Serialize decimals
        const serializedPartner = {
            ...partner,
            walletBalance: partner.walletBalance.toNumber(),
            stats: {
                totalSalesVolume: stats._sum.sellPrice?.toNumber() || 0,
                lastActive: stats._max.createdAt || null,
                successRate: Math.round(successRate)
            },
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
export async function updatePartner(id: string, data: { name: string, domain: string, subscriptionStatus: string }) {
    try {
        console.log('Updating partner:', id, data)
        await prisma.partner.update({
            where: { id },
            data: {
                name: data.name,
                domain: data.domain || null,
                subscriptionStatus: data.subscriptionStatus
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
