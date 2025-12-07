'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, Menu, Bell, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const { logout } = useAuth()

    const menuItems = [
        { name: 'หน้าหลัก', href: '/admin/dashboard', icon: LayoutDashboard },
    ]

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            fontFamily: 'Kanit, sans-serif',
            background: '#f0f5ff'
        }}>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Blue Gradient */}
            <aside style={{
                position: sidebarOpen ? 'fixed' : 'relative',
                left: 0,
                top: 0,
                bottom: 0,
                width: '260px',
                background: 'linear-gradient(180deg, #1e3a8a 0%, #3b82f6 100%)',
                flexShrink: 0,
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                transform: sidebarOpen ? 'translateX(0)' : undefined,
                boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
            }} className={`lg:translate-x-0 ${sidebarOpen ? '' : '-translate-x-full lg:relative lg:flex'}`}>

                {/* Brand */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.4)'
                        }}>
                            <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>E</span>
                        </div>
                        <div>
                            <p style={{ color: 'white', fontWeight: 600, fontSize: '16px', margin: 0 }}>Gamesflows</p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>Admin System</p>
                        </div>
                    </div>
                </div>

                {/* User Profile Card */}
                <div style={{ padding: '16px', margin: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            AD
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: 'white', fontWeight: 500, fontSize: '14px', margin: 0 }}>Admin User</p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>System Admin</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px', marginBottom: '8px' }}>
                        เมนูหลัก
                    </p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    marginBottom: '4px',
                                    textDecoration: 'none',
                                    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: isActive ? 600 : 400,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <item.icon size={20} style={{ opacity: isActive ? 1 : 0.7 }} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => logout()}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: 'rgba(239,68,68,0.2)',
                            border: 'none',
                            color: '#fca5a5',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={20} />
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                {/* Top Header */}
                <header style={{
                    height: '64px',
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    gap: '16px',
                    flexShrink: 0
                }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{ display: 'none', padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                        className="lg:hidden block"
                    >
                        <Menu size={24} color="#374151" />
                    </button>

                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        <span>หน้าหลัก</span>
                        <span style={{ margin: '0 8px' }}>/</span>
                        <span style={{ color: '#3b82f6', fontWeight: 500 }}>Dashboard</span>
                    </div>

                    <div style={{ flex: 1 }}></div>

                    {/* Search */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#f3f4f6',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        width: '240px'
                    }}>
                        <Search size={18} color="#9ca3af" />
                        <input
                            placeholder="ค้นหา..."
                            style={{
                                border: 'none',
                                background: 'none',
                                outline: 'none',
                                flex: 1,
                                fontSize: '14px',
                                color: '#374151'
                            }}
                        />
                    </div>

                    {/* Notifications */}
                    <button style={{
                        padding: '8px',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        position: 'relative'
                    }}>
                        <Bell size={20} color="#6b7280" />
                        <span style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '8px',
                            height: '8px',
                            background: '#ef4444',
                            borderRadius: '50%'
                        }}></span>
                    </button>

                    {/* Action Button */}
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                    }}>
                        + เพิ่ม Partner
                    </button>
                </header>

                {/* Content */}
                <main style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f0f5ff' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}
