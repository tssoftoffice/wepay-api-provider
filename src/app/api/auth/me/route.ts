import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: (session as any).userId },
        select: { id: true, username: true, role: true }
    })

    if (!user) {
        return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })
}
