'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, Menu, Bell, Search, Users, Gamepad2, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const { logout } = useAuth()

    const menuItems = [
        { name: 'หน้าหลัก', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Games', href: '/admin/games', icon: Gamepad2 },
        { name: 'Financials', href: '/admin/financials', icon: LayoutDashboard }, // Using LayoutDashboard for now, or DollarSign if imported
        { name: 'Start & Plans', href: '/admin/subscriptions', icon: CreditCard },
        { name: 'Partners', href: '/admin/partners', icon: Users },
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
                width: '260px',
                background: 'linear-gradient(180deg, #1e3a8a 0%, #3b82f6 100%)',
                transition: 'transform 0.3s ease-in-out',
                boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
            }} className={`fixed inset-y-0 left-0 z-50 flex flex-col lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Brand */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/logo.jpg" alt="GamesFlows Admin" style={{ height: '40px', width: 'auto', borderRadius: '50%' }} />
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
            <div className="" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
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
                        style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                        className="lg:hidden"
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
                    <div className="hidden sm:flex" style={{
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
                    <NotificationBell />

                    {/* Action Button */}
                    <Link
                        href="/admin/partners/create"
                        className="hidden sm:flex"
                        style={{
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
                            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                            textDecoration: 'none'
                        }}
                    >
                        + เพิ่ม Partner
                    </Link>
                </header>

                {/* Content */}
                <main style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f0f5ff' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}

import { getNotifications, markAllRead } from './actions'
import { useEffect } from 'react'

function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifs = async () => {
        const res = await getNotifications()
        if (res.success) {
            setNotifications(res.notifications || [])
            setUnreadCount(res.unreadCount || 0)
        }
    }

    useEffect(() => {
        fetchNotifs()
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifs, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleOpen = () => {
        if (!isOpen && unreadCount > 0) {
            markAllRead()
            setUnreadCount(0) // Optimistic update
        }
        setIsOpen(!isOpen)
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={handleOpen}
                style={{
                    padding: '8px',
                    background: isOpen ? '#e5e7eb' : '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    position: 'relative'
                }}
            >
                <Bell size={20} color="#6b7280" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        minWidth: '16px',
                        height: '16px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        padding: '0 4px'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '320px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    zIndex: 100,
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>การแจ้งเตือน</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>ล่าสุด</span>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                                ไม่มีรายการแจ้งเตือน
                            </div>
                        ) : (
                            notifications.map((n: any) => (
                                <div key={n.id} style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #f3f4f6',
                                    background: n.read ? 'white' : '#f0f9ff'
                                }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{n.title}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{n.message}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#94a3b8' }}>
                                        {new Date(n.createdAt).toLocaleTimeString('th-TH')}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
