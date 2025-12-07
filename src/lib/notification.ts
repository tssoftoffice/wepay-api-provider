export const sendNotification = async (to: string, message: string, type: 'EMAIL' | 'LINE' = 'EMAIL') => {
    // In real world, integrate with SendGrid / Line Notify API
    console.log(`[NOTIFICATION - ${type}] To: ${to} | Message: ${message}`)
    return true
}
