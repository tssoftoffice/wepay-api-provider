'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Card, Button, DatePicker, Select, Tag, Table, Pagination } from 'antd'
import { getTransactions, getPartnersAction } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const { RangePicker } = DatePicker
const { Option } = Select

function TransactionContent() {
    const searchParams = useSearchParams()
    const initialPartnerId = searchParams.get('partnerId') || 'ALL'
    const initialType = searchParams.get('type') || 'ALL'
    const initialStatus = searchParams.get('status') || 'ALL'

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any[]>([])
    const [partners, setPartners] = useState<any[]>([])
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

    // Filters
    const [filters, setFilters] = useState({
        type: initialType,
        status: initialStatus,
        partnerId: initialPartnerId,
        startDate: null as string | null,
        endDate: null as string | null,
        sortBy: 'date' // 'date' | 'partner'
    })

    // Load initial data and partners
    useEffect(() => {
        const init = async () => {
            const pRes = await getPartnersAction() // Load default 50
            if (pRes.success) {
                let currentPartners = pRes.data || []
                setPartners(currentPartners)
            }
        }
        init()
    }, [])

    // Debounced Partner Search
    const handlePartnerSearch = (val: string) => {
        // Simple manual debounce to avoid import lodash
        const timeoutId = setTimeout(async () => {
            const pRes = await getPartnersAction(val)
            if (pRes.success) setPartners(pRes.data || [])
        }, 500)
    }

    const fetchData = async (page = 1, currentLimit = pagination.limit) => {
        setLoading(true)
        try {
            const res = await getTransactions({
                page,
                limit: currentLimit,
                type: filters.type === 'ALL' ? undefined : filters.type,
                status: filters.status,
                partnerId: filters.partnerId === 'ALL' ? undefined : filters.partnerId,
                startDate: filters.startDate,
                endDate: filters.endDate,
                sortBy: filters.sortBy
            })

            if (res.success) {
                setData(res.data || [])
                setPagination(prev => ({ ...prev, page, limit: currentLimit, total: res.pagination?.total || 0 }))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(1)
    }, [filters])

    const handleTableChange = (page: number, pageSize: number) => {
        if (pageSize !== pagination.limit) {
            setPagination(prev => ({ ...prev, limit: pageSize }))
            fetchData(1, pageSize) // Reset to page 1 on size change
        } else {
            fetchData(page)
        }
    }

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: true,
            render: (date: string) => (
                <div>
                    <div>{new Date(date).toLocaleDateString('th-TH')}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(date).toLocaleTimeString('th-TH')}</div>
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={type === 'GAME_SALE' ? 'green' : type === 'TOPUP' ? 'blue' : 'purple'}>
                    {type}
                </Tag>
            )
        },
        {
            title: 'Detail',
            dataIndex: 'detail',
            key: 'detail',
        },
        {
            title: 'Partner',
            dataIndex: 'partner',
            key: 'partner',
            sorter: true,
        },
        {
            title: 'WePay Cost',
            dataIndex: 'providerPrice',
            key: 'providerPrice',
            align: 'right' as const,
            render: (val: number, record: any) => (
                <span style={{ color: '#ef4444' }}>
                    {val ? `฿${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '-'}
                </span>
            )
        },
        {
            title: 'Partner Price',
            dataIndex: 'baseCost',
            key: 'baseCost',
            align: 'right' as const,
            render: (val: number) => `฿${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
        },
        {
            title: 'Profit',
            dataIndex: 'profit',
            key: 'profit',
            align: 'right' as const,
            render: (val: number) => (
                <span style={{ color: val > 0 ? '#10b981' : val < 0 ? '#ef4444' : '#cbd5e1', fontWeight: 600 }}>
                    {val !== 0 ? `฿${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '-'}
                </span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: (status: string) => (
                <Tag color={status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'error' : 'warning'}>
                    {status}
                </Tag>
            )
        }
    ]

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link href="/admin/financials">
                    <Button icon={<ArrowLeft size={16} />}>Back</Button>
                </Link>
                <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Transaction Report</h1>
            </div>

            <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Date Range</div>
                        <RangePicker
                            onChange={(dates) => {
                                setFilters(prev => ({
                                    ...prev,
                                    startDate: dates ? dates[0]?.toISOString() || null : null,
                                    endDate: dates ? dates[1]?.toISOString() || null : null
                                }))
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Partner</div>
                        <Select
                            showSearch
                            placeholder="Type to search..."
                            filterOption={false}
                            onSearch={handlePartnerSearch}
                            style={{ width: 180 }}
                            onChange={(val) => setFilters(prev => ({ ...prev, partnerId: val }))}
                            value={filters.partnerId}
                            notFoundContent={null}
                        >
                            <Option value="ALL">All Partners</Option>
                            {partners.map((p: any) => (
                                <Option key={p.id} value={p.id}>{p.name}</Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Type</div>
                        <Select
                            value={filters.type}
                            style={{ width: 150 }}
                            onChange={(val) => setFilters(prev => ({ ...prev, type: val }))}
                        >
                            <Option value="ALL">All Types</Option>
                            <Option value="GAME_SALE">Game Sale</Option>
                            <Option value="SUBSCRIPTION">Subscription</Option>
                            <Option value="TOPUP">Top-up</Option>
                        </Select>
                    </div>
                    <div>
                        <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Status</div>
                        <Select
                            value={filters.status}
                            style={{ width: 120 }}
                            onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                        >
                            <Option value="ALL">All Status</Option>
                            <Option value="SUCCESS">Success</Option>
                            <Option value="FAILED">Failed</Option>
                            <Option value="PENDING">Pending</Option>
                        </Select>
                    </div>
                    <div>
                        <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Sort By</div>
                        <Select
                            defaultValue="date"
                            style={{ width: 140 }}
                            onChange={(val) => setFilters(prev => ({ ...prev, sortBy: val }))}
                        >
                            <Option value="date">Date (Newest)</Option>
                            <Option value="partner">Partner Name</Option>
                        </Select>
                    </div>
                </div>
            </Card>

            <Card>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Rows per page:</span>
                    <Select
                        value={pagination.limit}
                        style={{ width: 70 }}
                        onChange={(val) => handleTableChange(1, val)}
                    >
                        <Option value={20}>20</Option>
                        <Option value={50}>50</Option>
                        <Option value={100}>100</Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    onChange={(p, f, s: any) => {
                        if (s.order) {
                            if (s.field === 'partner') setFilters(prev => ({ ...prev, sortBy: 'partner' }))
                            if (s.field === 'date') setFilters(prev => ({ ...prev, sortBy: 'date' }))
                        }
                    }}
                />
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Pagination
                        current={pagination.page}
                        pageSize={pagination.limit}
                        total={pagination.total}
                        showSizeChanger={false}
                        onChange={(page) => handleTableChange(page, pagination.limit)}
                    />
                </div>
            </Card>
        </div>
    )
}

export default function TransactionReportPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TransactionContent />
        </Suspense>
    )
}
