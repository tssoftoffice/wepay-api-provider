'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Get all plans
export async function getPlans() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            orderBy: { price: 'asc' }
        })
        const serializedPlans = plans.map(plan => ({
            ...plan,
            price: plan.price.toNumber()
        }))
        return { success: true, data: serializedPlans }
    } catch (error) {
        console.error('Error fetching plans:', error)
        return { success: false, error: 'Failed to fetch plans' }
    }
}

// Create new plan
export async function createPlan(data: { name: string, price: number, duration: number, features: string }) {
    try {
        await prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                price: data.price,
                duration: data.duration,
                features: data.features,
                isActive: true
            }
        })
        revalidatePath('/admin/subscriptions')
        return { success: true }
    } catch (error) {
        console.error('Error creating plan:', error)
        return { success: false, error: 'Failed to create plan' }
    }
}

// Update plan
export async function updatePlan(id: string, data: { name: string, price: number, duration: number, features: string }) {
    try {
        await prisma.subscriptionPlan.update({
            where: { id },
            data: {
                name: data.name,
                price: data.price,
                duration: data.duration,
                features: data.features
            }
        })
        revalidatePath('/admin/subscriptions')
        return { success: true }
    } catch (error) {
        console.error('Error updating plan:', error)
        return { success: false, error: 'Failed to update plan' }
    }
}

// Toggle status
export async function togglePlanStatus(id: string, isActive: boolean) {
    try {
        await prisma.subscriptionPlan.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath('/admin/subscriptions')
        return { success: true }
    } catch (error) {
        console.error('Error updating plan status:', error)
        return { success: false, error: 'Failed to update plan status' }
    }
}
