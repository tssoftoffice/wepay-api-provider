import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function validateApiKey(req: NextRequest) {
    const apiKey = req.headers.get('X-API-KEY')
    const secretKey = req.headers.get('X-API-SECRET')

    if (!apiKey) {
        return { error: 'Missing API Key', status: 401 }
    }

    const partner = await prisma.partner.findUnique({
        where: { apiKey }
    })

    if (!partner) {
        return { error: 'Invalid API Key', status: 401 }
    }

    if (partner.secretKey && partner.secretKey !== secretKey) {
        // Optional: Enforce secret key if present, or just rely on API Key for simplicity if preferred.
        // For higher security, we should check it.
        return { error: 'Invalid Secret Key', status: 401 }
    }

    if (partner.subscriptionStatus !== 'ACTIVE') {
        return { error: 'Partner subscription is not active', status: 403 }
    }

    if (partner.subscriptionEnd && new Date() > partner.subscriptionEnd) {
        // Auto-expire if date passed
        await prisma.partner.update({
            where: { id: partner.id },
            data: { subscriptionStatus: 'EXPIRED' }
        })
        return { error: 'Partner subscription has expired', status: 403 }
    }

    return { partner }
}
