'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Paths where Navbar and Footer should be hidden
    const hideNavFooter = pathname.startsWith('/partner') || pathname === '/register/agent' || pathname.startsWith('/store') || pathname.startsWith('/admin')

    return (
        <>
            {!hideNavFooter && <Navbar />}
            {children}
            {!hideNavFooter && <Footer />}
        </>
    )
}
