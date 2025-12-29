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
            from: `"GamesFlows" <${process.env.SMTP_USER}>`,
            to,
            subject: 'แจ้งเตือน: การสมัครสมาชิกของคุณกำลังจะหมดอายุลง',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #4f46e5; text-align: center;">GamesFlows</h2>
                    <div style="padding: 20px; text-align: center;">
                        <p style="font-size: 16px; color: #374151;">เรียนคุณ <strong>${partnerName}</strong></p>
                        <p style="font-size: 16px; color: #374151;">
                            การสมัครสมาชิกของคุณกำลังจะหมดอายุในวันที่ <br />
                            <strong style="color: #ef4444; font-size: 18px;">${expiryDate}</strong>
                        </p>
                        <p style="color: #6b7280; font-size: 14px;">
                            กรุณาต่ออายุสมาชิกเพื่อการใช้งานที่ต่อเนื่อง และไม่พลาดสิทธิประโยชน์ต่างๆ
                        </p>
                        
                        <div style="margin: 30px 0;">
                            <a href="${renewLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                ต่ออายุสมาชิกทันที
                            </a>
                        </div>

                        <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                            หากคุณได้ทำการต่ออายุแล้ว กรุณาเพิกเฉยต่ออีเมลฉบับนี้
                        </p>
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

