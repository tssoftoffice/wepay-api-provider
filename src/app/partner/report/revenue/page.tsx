import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { RevenueReportClient } from './RevenueReportClient'
import styles from './report.module.css'

async function getRevenueData(searchParams: { startDate?: string, endDate?: string } | undefined) {
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') return null

    const user = await prisma.user.findUnique({
        where: { id: (session as any).userId },
        include: { partner: true }
    })

    if (!user?.partner) return null

    // Default to current month if no dates provided
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const start = searchParams?.startDate ? new Date(searchParams.startDate) : firstDay
    const end = searchParams?.endDate ? new Date(searchParams.endDate) : lastDay

    // Ensure end date includes the full day if time is 00:00:00
    if (end.getHours() === 0) {
        end.setHours(23, 59, 59)
    }

    const transactions = await prisma.gameTopupTransaction.findMany({
        where: {
            partnerId: user.partner.id,
            status: 'SUCCESS', // Only count successful transactions for revenue
            createdAt: {
                gte: start,
                lte: end
            }
        },
        orderBy: { createdAt: 'desc' },
        include: {
            game: {
                select: { name: true }
            }
        }
    })

    return {
        transactions,
        dateRange: {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        }
    }
}

export default async function RevenueReportPage({ searchParams }: { searchParams: Promise<{ startDate?: string, endDate?: string }> }) {
    const params = await searchParams
    const data = await getRevenueData(params)

    if (!data) {
        redirect('/')
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>รายงานรายได้</h1>
                <p className={styles.subtitle}>สรุปยอดขายและกำไรตามช่วงเวลา</p>
            </header>

            <RevenueReportClient
                initialTransactions={data.transactions}
                initialDateRange={data.dateRange}
            />
        </div>
    )
}
