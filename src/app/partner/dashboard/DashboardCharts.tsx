'use client'

import React, { useEffect, useState } from 'react'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import styles from './charts.module.css'

interface ChartData {
    pie: { name: string, value: number }[]
    revenueArea: { name: string, value: number }[]
    revenueMonthly?: { name: string, value: number }[]
    volumeBar: { name: string, value: number }[]
    statusPie: { name: string, value: number, color: string }[]
}

const COLORS = ['#5e35b1', '#1e88e5', '#90caf9', '#ede7f6', '#d1c4e9']

export function DashboardCharts() {
    const [data, setData] = useState<ChartData | null>(null)
    const [mounted, setMounted] = useState(false)
    const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('daily')

    useEffect(() => {
        setMounted(true)
        const script = document.getElementById('dashboard-data')
        if (script && script.textContent) {
            try {
                setData(JSON.parse(script.textContent))
            } catch (e) {
                console.error("Failed to parse dashboard data", e)
            }
        }
    }, [])

    if (!mounted || !data) return null

    // Safe accessors with fallback to empty array
    const revenueArea = data.revenueArea || []
    const revenueMonthly = data.revenueMonthly || []
    const volumeBar = data.volumeBar || []
    const statusPie = data.statusPie || []
    const gamePie = data.pie || []

    const currentRevenueData = timeframe === 'daily' ? revenueArea : revenueMonthly

    return (
        <div className={styles.chartsGrid}>

            {/* Revenue Area Chart */}
            <div className={`${styles.chartCard} ${styles.wide}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className={styles.chartTitle}>แนวโน้มรายได้ (Revenue Trend)</h3>
                    <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '8px' }}>
                        <button
                            onClick={() => setTimeframe('daily')}
                            style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: timeframe === 'daily' ? 'white' : 'transparent',
                                color: timeframe === 'daily' ? '#5e35b1' : '#64748b',
                                boxShadow: timeframe === 'daily' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            7 Days
                        </button>
                        <button
                            onClick={() => setTimeframe('monthly')}
                            style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: timeframe === 'monthly' ? 'white' : 'transparent',
                                color: timeframe === 'monthly' ? '#5e35b1' : '#64748b',
                                boxShadow: timeframe === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            6 Months
                        </button>
                    </div>
                </div>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                        <AreaChart data={currentRevenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#5e35b1" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#5e35b1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748b' }}
                                minTickGap={30}
                                dy={10}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `฿${val}`}
                                tick={{ fill: '#64748b' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => [<span style={{ color: '#5e35b1', fontWeight: 600 }}>฿{value.toLocaleString()}</span>, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#5e35b1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                animationDuration={800}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transaction Volume Bar Chart */}
            <div className={styles.chartCard} style={{ overflow: 'hidden' }}>
                <h3 className={styles.chartTitle}>จำนวนทำรายการ (Transactions)</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={volumeBar}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                            <YAxis fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            {/* Use Blue for Bars for contrast with Purple Revenue */}
                            <Bar dataKey="value" fill="#1e88e5" radius={[6, 6, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Pie Chart */}
            <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>สถานะรายการ (Status)</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={statusPie}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusPie.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Games Pie Chart */}
            <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>สัดส่วนยอดขายตามเกม (Top Games)</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={gamePie}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {gamePie.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    )
}
