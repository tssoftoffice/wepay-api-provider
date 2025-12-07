import React from 'react'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from './page.module.css'
import { PlaygroundClient } from './PlaygroundClient'

async function getPartnerData() {
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') return null

    const user = await prisma.user.findUnique({
        where: { id: (session as any).userId },
        include: { partner: true }
    })

    return user?.partner
}

export default async function PlaygroundPage() {
    const partner = await getPartnerData()

    if (!partner) {
        redirect('/login')
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>API Playground ⚡</h1>
                <p className={styles.subtitle}>Test your API integration in real-time.</p>
            </header>

            <PlaygroundClient
                apiKey={partner.apiKey || ''}
                secretKey={partner.secretKey || ''}
            />
        </div>
    )
}
