'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/partner/Sidebar'
import styles from './layout.module.css'

export default function PartnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className={styles.layout}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className={styles.main}>
                {/* Mobile Header for Toggle */}
                <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex items-center justify-between mb-4">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span className="font-bold text-gray-800">PARTNER PANEL</span>
                    <div className="w-8"></div> {/* Spacer */}
                </div>

                {children}
            </main>
        </div>
    )
}
