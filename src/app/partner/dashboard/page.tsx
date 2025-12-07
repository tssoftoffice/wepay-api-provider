import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardStats } from './DashboardStats'
import { DashboardCharts } from './DashboardCharts'
import styles from './page.module.css'

async function getPartnerData() {
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') return null

    const user = await prisma.user.findUnique({
        where: { id: (session as any).userId },
        include: { partner: true }
    })

    return user?.partner
}

export default async function DashboardPage() {
    const partner = await getPartnerData()
    if (!partner) {
        return <div className={styles.error}>Unauthorized Access</div>
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>แดชบอร์ด</h1>
                    <p className={styles.subtitle}>ยินดีต้อนรับกลับ, {partner.name}</p>
                </div>
            </header>

            <DashboardStats partnerId={partner.id} />

            <section className={styles.chartsSection}>
                <h2 className={styles.sectionHeading}>ภาพรวมธุรกิจ</h2>
                <DashboardCharts />
            </section>
        </div>
    )
}
