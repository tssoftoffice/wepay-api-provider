
const TELEGRAM_API_BASE = 'https://api.telegram.org/bot'

export async function sendTelegramNotify(message: string): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
        console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set. Skipping notification.')
        return false
    }

    try {
        const url = `${TELEGRAM_API_BASE}${token}/sendMessage`
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML' // Optional: allows bold/italic
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to send Telegram Notify:', response.status, errorText)
            return false
        }

        return true
    } catch (error) {
        console.error('Error sending Telegram Notify:', error)
        return false
    }
}
