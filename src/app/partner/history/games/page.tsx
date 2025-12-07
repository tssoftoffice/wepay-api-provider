import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { GameHistoryClient } from './GameHistoryClient'
import styles from './history.module.css'

async function getHistory() {
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') return null

    const user = await prisma.user.findUnique({
        where: { id: (session as any).userId },
        include: { partner: true }
    })

    if (!user?.partner) return null

    const transactions = await prisma.gameTopupTransaction.findMany({
        where: { partnerId: user.partner.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            game: {
                select: { name: true }
            }
        }
    })

    return transactions.map(tx => ({
        ...tx,
        baseCost: Number(tx.baseCost),
        sellPrice: Number(tx.sellPrice)
    }))
}

export default async function GameHistoryPage() {
    const transactions = await getHistory()

    if (!transactions) {
        redirect('/')
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>ประวัติการเติมเกม</h1>
                <p className={styles.subtitle}>รายการเติมเกมล่าสุดของคุณ</p>
            </header>

            <div className={styles.content}>
                <GameHistoryClient initialData={transactions} />
            </div>
        </div>
    )
}
