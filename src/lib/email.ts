import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false // Allow shared hosting certificates (fixes 'hostname does not match')
    }
})

export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log('==================================================')
        console.log(`[DEV MODE] SMTP Not Configured.`)
        console.log(`[DEV MODE] Email to: ${to}`)
        console.log(`[DEV MODE] OTP: ${otp}`)
        console.log('==================================================')
        return true // Pretend success for development
    }

    try {
        await transporter.sendMail({
            from: `"GamesFlows" <${process.env.SMTP_USER}>`,
            to,
            subject: 'รหัสยืนยันตัวตน (OTP) - GamesFlows',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4f46e5;">GamesFlows</h2>
                    <p>รหัส OTP ของคุณคือ:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>รหัสนี้จะหมดอายุใน 5 นาที</p>
                    <p style="color: #666; font-size: 14px;">หากคุณไม่ได้ร้องขอรหัสนี้ โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>
                </div>
            `,
        })
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log('==================================================')
        console.log(`[DEV MODE] SMTP Not Configured.`)
        console.log(`[DEV MODE] Reset Password Email to: ${to}`)
        console.log(`[DEV MODE] Reset Link: ${resetLink}`)
        console.log('==================================================')
        return true // Pretend success for development
    }

    try {
        await transporter.sendMail({
            from: `"GamesFlows" <${process.env.SMTP_USER}>`,
            to,
            subject: 'ตั้งค่ารหัสผ่านใหม่ (Reset Password) - GamesFlows',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4f46e5;">GamesFlows</h2>
                    <p>เราได้รับคำขอให้ตั้งค่ารหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
                    <p>คลิกที่ปุ่มด้านล่างเพื่อตั้งค่ารหัสผ่านใหม่:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">ตั้งรหัสผ่านใหม่</a>
                    </div>
                    <p style="margin-top: 20px;">หรือคลิกที่ลิงก์นี้: <a href="${resetLink}" style="color: #4f46e5;">${resetLink}</a></p>
                    <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
                    <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        หากคุณไม่ได้ส่งคำขอนี้ โปรดเพิกเฉยต่ออีเมลฉบับนี้
                    </p>
                </div>
            `,
        })
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

export async function sendSubscriptionExpiringEmail(to: string, partnerName: string, expiryDate: string, renewLink: string): Promise<boolean> {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log('==================================================')
        console.log(`[DEV MODE] SMTP Not Configured.`)
        console.log(`[DEV MODE] Expiring Email to: ${to}`)
        console.log(`[DEV MODE] Partner: ${partnerName}`)
        console.log(`[DEV MODE] Expiry: ${expiryDate}`)
        console.log('==================================================')
        return true // Pretend success for development
    }

    try {
        await transporter.sendMail({
            from: `"GamesFlows System" <${process.env.SMTP_USER}>`,
            to,
            subject: 'แจ้งเตือน: การต่ออายุสมาชิก GamesFlows (ด่วน)',
            html: `
                <div style="font-family: 'Sarabun', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border: 1px solid #e5e7eb;">
                    <!-- Header -->
                    <div style="background-color: #4f46e5; padding: 30px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">GamesFlows</h1>
                        <p style="color: #e0e7ff; margin: 5px 0 0; font-size: 14px;">ระบบจัดการร้านค้าเกมครบวงจร</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px; color: #374151;">
                        <p style="font-size: 16px; margin-bottom: 20px;">เรียน คุณ <strong>${partnerName}</strong></p>
                        
                        <p style="line-height: 1.6; margin-bottom: 15px;">
                            ฝ่ายบริการลูกค้า GamesFlows ขอเรียนแจ้งให้ท่านทราบว่า แพ็กเกจสมาชิกปัจจุบันของท่านกำลังจะครบกำหนดอายุการใช้งานในวันที่
                        </p>

                        <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 15px; margin: 25px 0;">
                            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">
                                วันหมดอายุ: ${expiryDate}
                            </p>
                            <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;">เหลือเวลาอีก 3 วัน</p>
                        </div>

                        <p style="line-height: 1.6; margin-bottom: 15px;">
                            เพื่อให้ธุรกิจของท่านดำเนินไปได้อย่างต่อเนื่อง แะลป้องกันการระงับการให้บริการที่อาจส่งผลกระทบต่อลูกค้าของท่าน ทางเราขอแนะนำให้ท่านดำเนินการต่ออายุสมาชิกก่อนถึงวันดังกล่าว
                        </p>

                         <p style="line-height: 1.6; margin-bottom: 25px;">
                            <strong>สิทธิประโยชน์ต่อเนื่องที่ท่านจะได้รับ:</strong><br/>
                            • การเข้าถึงระบบจัดการร้านค้าตลอด 24 ชั่วโมง<br/>
                            • การอัปเดตสถานะการเติมเกมแบบ Real-time<br/>
                            • การสนับสนุนทางเทคนิคจากทีมงานมืออาชีพ
                        </p>

                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${renewLink}" style="background-color: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                                ดำเนินการต่ออายุสมาชิก
                            </a>
                        </div>

                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                        
                        <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
                            หมายเหตุ: หากท่านได้ดำเนินการชำระค่าบริการเรียบร้อยแล้ว ทางระบบต้องขออภัยในความไม่สะดวกมา ณ ที่นี้ และท่านสามารถเพิกเฉยต่ออีเมลฉบับนี้ได้
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} GamesFlows System. All rights reserved.</p>
                        <p style="margin: 5px 0 0;">นี่เป็นอีเมลอัตโนมัติ กรุณาอย่าตอบกลับ</p>
                    </div>
                </div>
            `,
        })
        return true
    } catch (error) {
        console.error('Error sending expiring email:', error)
        return false
    }
}

