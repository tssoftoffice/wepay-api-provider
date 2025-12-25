'use client'

import React, { useState } from 'react'
import styles from './page.module.css'

interface PlaygroundClientProps {
    apiKey: string
    secretKey: string
}

export function PlaygroundClient({ apiKey, secretKey }: PlaygroundClientProps) {
    const [endpoint, setEndpoint] = useState('/balance')
    const [method, setMethod] = useState('GET')
    const [params, setParams] = useState({
        game_id: '',
        player_id: '',
        server: '',
        transaction_id: ''
    })
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<any>(null)
    const [status, setStatus] = useState<number | null>(null)

    const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setEndpoint(val)
        if (val === '/balance' || val === '/games' || val.includes('/transaction')) {
            setMethod('GET')
        } else {
            setMethod('POST')
        }
        setResponse(null)
        setStatus(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setParams({ ...params, [e.target.name]: e.target.value })
    }

    const executeRequest = async () => {
        setLoading(true)
        setResponse(null)
        setStatus(null)

        try {
            let url = `/api/v1${endpoint}`
            let body = undefined

            if (endpoint === '/transaction/:id') {
                if (!params.transaction_id) {
                    alert('Please enter a Transaction ID')
                    setLoading(false)
                    return
                }
                url = url.replace(':id', params.transaction_id)
            } else if (method === 'POST') {
                body = JSON.stringify({
                    game_id: params.game_id,
                    player_id: params.player_id,
                    server: params.server || undefined
                })
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                    'X-API-SECRET': secretKey
                },
                body
            })

            setStatus(res.status)
            const data = await res.json()
            setResponse(data)

        } catch (err: any) {
            setResponse({ error: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.playgroundWrapper}>
            {/* Control Panel */}
            <div className={styles.controlPanel}>
                <h2 className={styles.sectionTitle}>Request Configuration</h2>

                <label className={styles.label}>Endpoint</label>
                <select className={styles.select} value={endpoint} onChange={handleEndpointChange}>
                    <option value="/balance">/balance (Check Balance)</option>
                    <option value="/games">/games (Get Game List)</option>
                    <option value="/topup">/topup (Topup Game)</option>
                    <option value="/transaction/:id">/transaction/:id (Check Status)</option>
                </select>

                <div className={styles.endpointDisplay}>
                    <span className={`${styles.methodBadge} ${method === 'GET' ? styles.get : styles.post}`}>
                        {method}
                    </span>
                    <span className={styles.urlText}>
                        {endpoint === '/transaction/:id' && params.transaction_id
                            ? `/api/v1/transaction/${params.transaction_id}`
                            : `/api/v1${endpoint}`}
                    </span>
                </div>

                {endpoint === '/topup' && (
                    <>
                        <label className={styles.label}>Game ID / Code</label>
                        <input className={styles.input} name="game_id" value={params.game_id} onChange={handleChange} placeholder="e.g. gtopup_ROBLOX_300" />

                        <label className={styles.label}>Player ID / Ref 1</label>
                        <input className={styles.input} name="player_id" value={params.player_id} onChange={handleChange} placeholder="e.g. 12345678" />

                        <label className={styles.label}>Server / Ref 2 (Optional)</label>
                        <input className={styles.input} name="server" value={params.server} onChange={handleChange} placeholder="e.g. asia" />
                    </>
                )}

                {endpoint === '/transaction/:id' && (
                    <>
                        <label className={styles.label}>Transaction ID</label>
                        <input className={styles.input} name="transaction_id" value={params.transaction_id} onChange={handleChange} placeholder="Enter Transaction UUID" />
                    </>
                )}

                <button className={styles.button} onClick={executeRequest} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Request'}
                </button>
            </div>

            {/* Response Panel */}
            <div className={styles.responsePanel}>
                <div className={styles.responseHeader}>
                    <span>Response</span>
                    {status && (
                        <span className={`${styles.status} ${status >= 200 && status < 300 ? styles.success : styles.error}`}>
                            Status: {status}
                        </span>
                    )}
                </div>
                <div className={styles.jsonWrapper}>
                    <div className={styles.jsonOutput}>
                        {response ? JSON.stringify(response, null, 2) : '// Response will appear here...'}
                    </div>
                </div>
            </div>
        </div>
    )
}
