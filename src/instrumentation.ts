import { type Instrumentation } from 'next'

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { syncGames } = await import('./app/admin/games/actions')

        console.log('Starting Game Sync Scheduler...')

        // Sync every 24 hours (86400000 ms)
        setInterval(async () => {
            console.log('[Scheduler] Running daily game sync...')
            try {
                await syncGames()
                console.log('[Scheduler] Game sync completed')
            } catch (error) {
                console.error('[Scheduler] Game sync failed:', error)
            }
        }, 24 * 60 * 60 * 1000)
    }
}
