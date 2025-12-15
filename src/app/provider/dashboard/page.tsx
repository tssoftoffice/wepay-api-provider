import React from 'react'
export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import styles from './page.module.css'

async function getDashboardData() {
    const totalPartners = await prisma.partner.count()
    const totalCustomers = await prisma.customer.count()

    const gameRevenue = await prisma.gameTopupTransaction.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { baseCost: true }
    })

    const subRevenue = await prisma.subscriptionTransaction.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
    })

    const totalRevenue = (Number(gameRevenue._sum.baseCost) || 0) + (Number(subRevenue._sum.amount) || 0)

    return {
        totalPartners,
        totalCustomers,
        totalRevenue
    }
}

export default async function ProviderDashboard() {
    const data = await getDashboardData()

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Provider Dashboard</h1>

            <div className={styles.grid}>
                <Card>
                    <h3>Total Revenue</h3>
                    <p className={styles.value}>฿{data.totalRevenue.toLocaleString()}</p>
                </Card>
                <Card>
                    <h3>Total Partners</h3>
                    <p className={styles.value}>{data.totalPartners}</p>
                </Card>
                <Card>
                    <h3>Total Customers</h3>
                    <p className={styles.value}>{data.totalCustomers}</p>
                </Card>
            </div>
        </div>
    )
}
