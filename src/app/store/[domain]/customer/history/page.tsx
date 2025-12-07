import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default async function CustomerHistoryPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params
    const session = await getSession()

    if (!session) {
        redirect(`/store/${domain}/customer/login`)
    }

    const partner = await prisma.partner.findUnique({ where: { domain } })
    if (!partner) return <div style={{ padding: '2rem', textAlign: 'center' }}>Store not found</div>

    const customer = await prisma.customer.findFirst({
        where: { userId: (session as any).userId, partnerId: partner.id }
    })

    if (!customer) {
        redirect(`/store/${domain}/customer/login`)
    }

    const topupRequests = await prisma.topupRequest.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' }
    })

    const gameTopups = await prisma.gameTopupTransaction.findMany({
        where: { customerId: customer.id },
        include: { game: true },
        orderBy: { createdAt: 'desc' }
    })

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return '#16a34a'
            case 'PENDING': return '#ca8a04'
            case 'FAILED': return '#dc2626'
            case 'REJECTED': return '#dc2626'
            default: return '#64748b'
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>Transaction History</h1>
                <Link href={`/store/${domain}/customer/topup`}>
                    <Button>Topup Credit</Button>
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Wallet Topup History */}
                <section>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>
                        Wallet Topups
                    </h2>
                    {topupRequests.length === 0 ? (
                        <Card style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            No topup history
                        </Card>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {topupRequests.map(req => (
                                <Card key={req.id} style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                                            Topup Credit
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            {formatDate(req.createdAt)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                            +฿{Number(req.amount).toLocaleString()}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            color: getStatusColor(req.status),
                                            background: `${getStatusColor(req.status)}20`,
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '99px',
                                            display: 'inline-block'
                                        }}>
                                            {req.status}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* Game Topup History */}
                <section>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>
                        Game Purchases
                    </h2>
                    {gameTopups.length === 0 ? (
                        <Card style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            No purchase history
                        </Card>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {gameTopups.map(txn => (
                                <Card key={txn.id} style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                                            {txn.game.name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            {formatDate(txn.createdAt)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '700', color: '#dc2626', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                            -฿{Number(txn.sellPrice).toLocaleString()}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            color: getStatusColor(txn.status),
                                            background: `${getStatusColor(txn.status)}20`,
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '99px',
                                            display: 'inline-block'
                                        }}>
                                            {txn.status}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
