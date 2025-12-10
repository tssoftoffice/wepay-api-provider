'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10
        })
        const unreadCount = await prisma.notification.count({
            where: { read: false }
        })
        return { success: true, notifications, unreadCount }
    } catch (error) {
        return { success: false, error: 'Failed to fetch notifications' }
    }
}

export async function markAllRead() {
    try {
        await prisma.notification.updateMany({
            where: { read: false },
            data: { read: true }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}
