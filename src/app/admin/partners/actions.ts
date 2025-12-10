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
        const partner = await prisma.partner.findUnique({
            where: { id },
            include: {
                users: true,
                package: true,
                _count: {
                    select: {
                        customers: true,
                        gameTopups: true
                    }
                }
            }
        })

        if (!partner) return { success: false, error: 'Partner not found' }

        // Fetch recent transactions
        const recentTransactions = await prisma.gameTopupTransaction.findMany({
            where: { partnerId: id },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                game: { select: { name: true } },
                customer: { select: { userId: true } } // Ideally get customer name via User, but simplified
            }
        })

        // Serialize decimals
        const serializedPartner = {
            ...partner,
            walletBalance: partner.walletBalance.toNumber(),
            recentTransactions: recentTransactions.map(txn => ({
                ...txn,
                baseCost: txn.baseCost.toNumber(),
                sellPrice: txn.sellPrice.toNumber(),
                providerPrice: txn.providerPrice.toNumber(),
            }))
        }

        return { success: true, data: serializedPartner }
    } catch (error) {
        console.error('Error fetching partner details:', error)
        return { success: false, error: 'Failed to fetch partner details' }
    }
}
