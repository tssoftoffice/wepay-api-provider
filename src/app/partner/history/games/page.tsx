import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { GameHistoryClient } from './GameHistoryClient'
import styles from './history.module.css'

export default async function GameHistoryPage() {
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') {
        redirect('/')
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>ประวัติการเติมเกม (Game Top-up)</h1>
                <p className={styles.subtitle}>รายการเติมเกมล่าสุดของคุณ</p>
            </header>

            <div className={styles.content}>
                <GameHistoryClient />
            </div>
        </div>
    )
}
