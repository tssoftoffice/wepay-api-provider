
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendSubscriptionExpiringEmail } from '@/lib/email'

export const dynamic = 'force-dynamic' // Ensure it's not cached

export async function GET(req: Request) {
    try {
        // 1. Calculate the target date range (3 days from now)
        // We want to find partners whose subscription expires exactly 3 days from TODAY
        // Or we could check range [now, now + 3 days] to be safe, but typically a daily cron targetting exact day + 3 is standard.
        // Let's do exact day + 3 to avoid spamming everyday.

        const now = new Date()
        const targetDate = new Date(now)
        targetDate.setDate(now.getDate() + 3)

        // Set time to start of day and end of day for precise querying
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

        console.log(`Checking for subscriptions expiring between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`)

        // 2. Find partners
        const expiringPartners = await prisma.partner.findMany({
            where: {
                subscriptionStatus: 'ACTIVE',
                subscriptionEnd: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                users: {
                    some: {
                        role: 'PARTNER_OWNER',
                        email: { not: null }
                    }
                }
            },
            include: {
                users: {
                    where: { role: 'PARTNER_OWNER' },
                    take: 1
                }
            }
        })

        console.log(`Found ${expiringPartners.length} expiring partners.`)

        // 3. Send Emails
        let sentCount = 0
        for (const partner of expiringPartners) {
            const owner = partner.users[0]
            if (owner && owner.email) {
                const renewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/partner/subscription`
                const expiryStr = partner.subscriptionEnd ? new Date(partner.subscriptionEnd).toLocaleDateString('th-TH') : '-'

                const success = await sendSubscriptionExpiringEmail(owner.email, partner.name, expiryStr, renewLink)
                if (success) sentCount++
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${expiringPartners.length} partners. Sent ${sentCount} emails.`
        })

    } catch (error) {
        console.error('Error in cron subscription check:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
