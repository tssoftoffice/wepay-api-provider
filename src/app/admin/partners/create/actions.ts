'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { redirect } from 'next/navigation'

const createPartnerSchema = z.object({
    firstName: z.string().min(1, 'กรุณาระบุชื่อจริง'),
    lastName: z.string().min(1, 'กรุณาระบุนามสกุล'),
    phone: z.string().min(10, 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก'),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    storeName: z.string().min(3, 'ชื่อร้านค้าต้องมีอย่างน้อย 3 ตัวอักษร'),
    username: z.string().min(4, 'Username ต้องมีอย่างน้อย 4 ตัวอักษร'),
    password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
})

export async function createPartnerAction(prevState: any, formData: FormData) {
    const rawData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        storeName: formData.get('storeName'),
        username: formData.get('username'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    }

    const validatedFields = createPartnerSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
            message: 'กรุณาตรวจสอบข้อมูลให้ถูกต้อง'
        }
    }

    const { firstName, lastName, phone, email, storeName, username, password } = validatedFields.data

    try {
        // Check for existing duplicates
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        })

        if (existingUser) {
            return {
                message: existingUser.username === username
                    ? 'Username นี้ถูกใช้งานแล้ว'
                    : 'อีเมลนี้ถูกใช้งานแล้ว'
            }
        }

        const hashedPassword = await hashPassword(password)

        // Create Partner and User
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    email,
                    firstName,
                    lastName,
                    phone,
                    role: 'PARTNER_OWNER'
                }
            })

            const partner = await tx.partner.create({
                data: {
                    name: storeName,
                    subscriptionStatus: 'ACTIVE', // Auto-activate for admin created
                    users: {
                        connect: { id: user.id }
                    }
                }
            })

            await tx.user.update({
                where: { id: user.id },
                data: { partnerId: partner.id }
            })
        })

    } catch (error) {
        console.error('Create Partner Error:', error)
        return { message: 'เกิดข้อผิดพลาดในการสร้าง Partner โปรดลองใหม่อีกครั้ง' }
    }

    redirect('/admin/dashboard')
}
