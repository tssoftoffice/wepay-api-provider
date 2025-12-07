'use client'

import React from 'react'
import styles from './page.module.css'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function GamesPage() {
    const { t } = useLanguage()

    const games = [
        'Free Fire', 'ROV', 'Mobile Legends', 'Valorant', 'PUBG Mobile',
        'Genshin Impact', 'Roblox', 'Call of Duty', 'FIFA Mobile', 'League of Legends',
        'Honkai Star Rail', 'Cookie Run', 'Ragnarok Origin', 'Undawn', 'Zepeto',
        'Diablo Immortal', 'Sausage Man', 'Super Sus', 'Marvel Snap', 'Nikke',
        'Overwatch 2', 'Ragnarok M', 'MU Origin 3', 'Dragon Raja'
    ]

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{t.sections.gameTopup}</h1>
                </header>

                <div className={styles.grid}>
                    {games.map((game, index) => (
                        <Link href={`/games/${index}`} key={index} className={styles.gameCard}>
                            <div className={`${styles.imageWrapper} ${styles[`card${index % 8}`]}`}>
                                {game[0]}
                            </div>
                            <span className={styles.gameName}>{game}</span>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}
