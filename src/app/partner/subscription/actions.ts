'use server'

import prisma from '@/lib/prisma'

export async function getActivePlans() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        })
        const serializedPlans = plans.map(plan => ({
            ...plan,
            price: plan.price.toNumber()
        }))
        return { success: true, data: serializedPlans }
    } catch (error) {
        console.error('Error fetching active plans:', error)
        return { success: false, error: 'Failed to fetch plans' }
    }
}
