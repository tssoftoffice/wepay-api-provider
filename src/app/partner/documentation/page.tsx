import React from 'react'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from './page.module.css'

async function getPartnerData() {
    const session = await getSession()
    if (!session || (session as any).role !== 'PARTNER_OWNER') return null

    const user = await prisma.user.findUnique({
        where: { id: (session as any).userId },
        include: { partner: true }
    })

    return user?.partner
}

export default async function DocumentationPage() {
    const partner = await getPartnerData()

    if (!partner) {
        redirect('/login')
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>API Documentation</h1>
                <p className={styles.subtitle}>คู่มือการใช้งานระบบอัตโนมัติ EvoPlayShop สำหรับนักพัฒนา</p>
                <p className={styles.description}>
                    คุณสามารถนำ API เหล่านี้ไปเชื่อมต่อกับเว็บไซต์ หรือ Application ของคุณเพื่อสร้างระบบเติมเกมอัตโนมัติได้ทันที
                </p>
            </header>

            <div className={styles.content}>

                {/* Authentication Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>🔑 1. การยืนยันตัวตน (Authentication)</h2>
                    <p className={styles.text}>
                        ทุกครั้งที่มีการเรียกใช้งาน API คุณจำเป็นต้องแนบ <strong>API Key</strong> และ <strong>Secret Key</strong>
                        ไปในส่วนของ Header ของ Request เพื่อยืนยันสิทธิ์การเข้าถึงข้อมูล
                    </p>

                    <div className={styles.keyBox}>
                        <div className={styles.keyItem}>
                            <label>X-API-KEY (Public)</label>
                            <div className={styles.keyValue}>
                                <code>{partner.apiKey || 'No API Key Generated'}</code>
                            </div>
                            <p className={styles.keyHint}>ใช้สำหรับระบุตัวตนร้านค้าของคุณ</p>
                        </div>
                        <div className={styles.keyItem}>
                            <label>X-API-SECRET (Private)</label>
                            <div className={styles.keyValue}>
                                <code>{partner.secretKey || 'No Secret Key Generated'}</code>
                            </div>
                            <p className={styles.keyHint}>เก็บเป็นความลับ! ใช้ยืนยันคำสั่งซื้อและการทำธุรกรรม</p>
                        </div>
                    </div>
                </section>

                <hr className={styles.divider} />

                {/* Balance Endpoint */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>💰 2. เช็คยอดเงินคงเหลือ (Get Balance)</h2>
                    <p className={styles.text}>ใช้สำหรับดึงข้อมูลยอดเงินคงเหลือในกระเป๋าของคุณ</p>

                    <div className={styles.endpointBox}>
                        <span className={`${styles.method} ${styles.get}`}>GET</span>
                        <code className={styles.url}>/api/v1/balance</code>
                    </div>

                    <h3 className={styles.subTitle}>ตัวอย่างการเรียกใช้งาน (Node.js)</h3>
                    <pre className={styles.codeBlock}>
                        {`const axios = require('axios');

const response = await axios.get('https://your-domain.com/api/v1/balance', {
  headers: {
    'X-API-KEY': '${partner.apiKey || 'YOUR_API_KEY'}',
    'X-API-SECRET': '${partner.secretKey || 'YOUR_SECRET_KEY'}'
  }
});

console.log(response.data);`}
                    </pre>

                    <h3 className={styles.subTitle}>ตัวอย่าง Response</h3>
                    <pre className={styles.codeBlock}>
                        {`{
  "data": {
    "partner_name": "My Shop",
    "wallet_balance": 1540.00,
    "currency": "THB"
  }
}`}
                    </pre>
                </section>

                <hr className={styles.divider} />

                {/* Games Endpoint */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>🎮 3. ดึงรายการเกม (Get Game List)</h2>
                    <p className={styles.text}>
                        ดึงรายการสินค้า เกม และราคาต้นทุนของคุณ เพื่อนำไปแสดงผลบนหน้าเว็บของคุณ
                    </p>

                    <div className={styles.endpointBox}>
                        <span className={`${styles.method} ${styles.get}`}>GET</span>
                        <code className={styles.url}>/api/v1/games</code>
                    </div>

                    <h3 className={styles.subTitle}>รายละเอียด Fields</h3>
                    <ul className={styles.list}>
                        <li><strong>id</strong>: รหัสอ้างอิงของเกม (ใช้สำหรับส่งคำสั่งซื้อ)</li>
                        <li><strong>code</strong>: รหัสสินค้า</li>
                        <li><strong>name</strong>: ชื่อแพ็กเกจเกม</li>
                        <li><strong>price</strong>: ราคาที่คุณต้องจ่าย (ต้นทุน)</li>
                        <li><strong>servers</strong>: รายชื่อเซิร์ฟเวอร์ (ถ้ามี)</li>
                    </ul>

                    <pre className={styles.codeBlock}>
                        {`// ตัวอย่างข้อมูลที่ได้รับ
{
  "data": [
    {
      "id": "5fca7bfe...", 
      "code": "gtopup_FREEFIRE_10",
      "name": "Free Fire 10 THB",
      "price": 9.50, // ราคาต้นทุนของคุณ
      "servers": null
    },
    {
      "id": "7a8b9c0d...",
      "name": "Genshin Impact",
      "servers": [
          {"value": "asia", "name": "Asia Server"},
          {"value": "usa", "name": "America Server"}
      ]
    }
  ]
}`}
                    </pre>
                </section>

                <hr className={styles.divider} />

                {/* Topup Endpoint */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>⚡ 4. เติมเงิน (Topup Game)</h2>
                    <p className={styles.text}>ส่งคำสั่งเติมเงินให้ลูกค้าของคุณ</p>

                    <div className={styles.endpointBox}>
                        <span className={`${styles.method} ${styles.post}`}>POST</span>
                        <code className={styles.url}>/api/v1/topup</code>
                    </div>

                    <h3 className={styles.subTitle}>Parameters (JSON Body)</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ชื่อตัวแปร</th>
                                <th>ชนิดข้อมูล</th>
                                <th>จำเป็น?</th>
                                <th>คำอธิบาย</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>game_id</td>
                                <td>String</td>
                                <td>Yes</td>
                                <td>ID ของเกมที่ได้จาก API /games</td>
                            </tr>
                            <tr>
                                <td>player_id</td>
                                <td>String</td>
                                <td>Yes</td>
                                <td>ID ผู้เล่น หรือ Username ในเกม</td>
                            </tr>
                            <tr>
                                <td>server</td>
                                <td>String</td>
                                <td>No</td>
                                <td>จำเป็นสำหรับบางเกม เช่น Genshin (ส่งค่า value จากรายการ servers)</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className={styles.subTitle}>ตัวอย่าง Code การเติมเงิน</h3>
                    <pre className={styles.codeBlock}>
                        {`await axios.post('https://your-domain.com/api/v1/topup', {
    "game_id": "เลือก ID จาก API Games",
    "player_id": "12345678",
    "server": "asia" // ใส่เฉพาะเกมที่มีให้เลือก Server
}, {
    headers: { ...keys }
});`}
                    </pre>
                </section>

                <hr className={styles.divider} />

                {/* Transaction Status Endpoint */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>🧾 5. ตรวจสอบสถานะ (Check Status)</h2>
                    <p className={styles.text}>ตรวจสอบสถานะรายการเติมเงิน ย้อนหลัง</p>

                    <div className={styles.endpointBox}>
                        <span className={`${styles.method} ${styles.get}`}>GET</span>
                        <code className={styles.url}>/api/v1/transaction/:id</code>
                    </div>

                    <p className={styles.text}>:id คือ Transaction ID ที่ได้รับจาก Response ของ API Topup</p>
                </section>

            </div>
        </div>
    )
}
