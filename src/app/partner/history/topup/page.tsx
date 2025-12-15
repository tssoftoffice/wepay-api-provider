import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TopupHistoryClient } from './TopupHistoryClient'
import styles from '../games/history.module.css'

export default async function TopupHistoryPage() {
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') {
        redirect('/')
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>ประวัติการเติมเครดิต (Credit Top-up)</h1>
                <p className={styles.subtitle}>รายการเติมเงินเข้าระบบล่าสุดของคุณ</p>
            </header>

            <div className={styles.content}>
                <TopupHistoryClient />
            </div>
        </div>
    )
}
