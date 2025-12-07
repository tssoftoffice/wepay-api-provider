import React from 'react'
import { Sidebar } from '@/components/partner/Sidebar'
import styles from './layout.module.css'

export default function PartnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}
