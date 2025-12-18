'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, Menu, Bell, Search, Users, Gamepad2, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import styles from './adminLayout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const { logout } = useAuth()

    const menuItems = [
        { name: 'หน้าหลัก', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Games', href: '/admin/games', icon: Gamepad2 },
        { name: 'Financials', href: '/admin/financials', icon: LayoutDashboard },
        { name: 'Start & Plans', href: '/admin/subscriptions', icon: CreditCard },
        { name: 'Partners', href: '/admin/partners', icon: Users },
    ]

    return (
        <div className={styles.layoutContainer}>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className={styles.mobileBackdrop}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarVisible : styles.sidebarHidden}`}>
                {/* Brand */}
                <div className={styles.sidebarHeader}>
                    <div className={styles.brand}>
                        <img src="/logo.jpg" alt="GamesFlows Admin" className={styles.brandLogo} />
                        <div>
                            <p className={styles.brandText}>Gamesflows</p>
                            <p className={styles.brandSubDetails}>Admin System</p>
                        </div>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className={styles.profileCard}>
                    <div className={styles.profileContent}>
                        <div className={styles.avatar}>
                            AD
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ color: 'white', fontWeight: 500, fontSize: '14px', margin: 0 }}>Admin User</p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>System Admin</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <p className={styles.menuTitle}>
                        เมนูหลัก
                    </p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navLink} ${isActive ? styles.navLinkActive : styles.navLinkInactive}`}
                            >
                                <item.icon size={20} style={{ opacity: isActive ? 1 : 0.7 }} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div className={styles.logoutSection}>
                    <button
                        onClick={() => logout()}
                        className={styles.logoutButton}
                    >
                        <LogOut size={20} />
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Top Header */}
                <header className={styles.header}>
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
                    <div className={styles.searchBar}>
                        <Search size={18} color="#9ca3af" />
                        <input
                            placeholder="ค้นหา..."
                            className={styles.searchInput}
                        />
                    </div>

                    {/* Notifications */}
                    <NotificationBell />

                    {/* Action Button */}
                    <Link
                        href="/admin/partners/create"
                        className={styles.actionButton}
                    >
                        + เพิ่ม Partner
                    </Link>
                </header>

                {/* Content */}
                <main className={styles.pageContent}>
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
