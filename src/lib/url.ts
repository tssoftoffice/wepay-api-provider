
export const getAppUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
    }

    // Fallback for different environments or default to production
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }

    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000'
    }

    return 'https://gamesflows.com'
}
