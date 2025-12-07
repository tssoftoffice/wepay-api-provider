import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'PARTNER_OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session as any).userId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true }
        })

        if (!user?.partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        return NextResponse.json({ partner: user.partner })

    } catch (error) {
        console.error('Settings fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession()
        if (!session || (session as any).role !== 'PARTNER_OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session as any).userId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { partner: true }
        })

        if (!user?.partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        const body = await request.json()
        const { name, domain, themeConfig } = body

        // Validate domain uniqueness if changed
        if (domain && domain !== user.partner.domain) {
            const existing = await prisma.partner.findUnique({ where: { domain } })
            if (existing) {
                return NextResponse.json({ error: 'Domain already taken' }, { status: 400 })
            }
        }

        // Build update data with only provided fields
        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (domain !== undefined) updateData.domain = domain
        if (themeConfig !== undefined) {
            updateData.themeConfig = typeof themeConfig === 'string' ? themeConfig : JSON.stringify(themeConfig)
        }

        const updatedPartner = await prisma.partner.update({
            where: { id: user.partner.id },
            data: updateData
        })

        return NextResponse.json({ partner: updatedPartner })

    } catch (error) {
        console.error('Settings update error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
