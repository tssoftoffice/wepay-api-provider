'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function GenerateKeysButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/partner/keys/generate', {
                method: 'POST'
            })
            if (!res.ok) throw new Error('Failed to generate keys')

            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to generate keys')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate API Keys'}
        </Button>
    )
}
