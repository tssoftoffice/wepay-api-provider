import prisma from '@/lib/prisma'

export async function getStoreData(domain: string, categoryFilter?: 'gtopup' | 'mtopup' | 'cashcard') {
    const partner = await prisma.partner.findUnique({
        where: { domain },
        include: {
            gamePrices: {
                include: { game: true }
            }
        }
    })

    if (!partner) return null

    // Group by Company
    const gamesMap = new Map();
    partner.gamePrices.forEach(gp => {
        // Extract company and type from code
        // Format: TYPE_COMPANY_PRICE (e.g., mtopup_12CALL_10)
        let company = 'Other'
        let type = 'other'

        const parts = gp.game.code.split('_')
        if (['mtopup', 'gtopup', 'cashcard'].includes(parts[0]) && parts.length >= 2) {
            type = parts[0]
            company = parts[1]
        } else if (parts.length > 0) {
            company = parts[0]
            // Try to guess type for legacy or weird codes if needed, or default to 'gtopup' if unknown?
            // For now, treat unknown as 'other' or maybe 'gtopup' if we want to be inclusive.
        }

        // Apply Filter
        if (categoryFilter && type !== categoryFilter) {
            return
        }

        // Use the company name as the key
        if (!gamesMap.has(company)) {
            gamesMap.set(company, {
                id: gp.game.id, // Use the first game's ID as the link
                name: gp.game.name.replace(/\s+\d+.*/, '').trim(), // Extract name by removing price numbers
                code: company,
                type: type,
                minPrice: Number(gp.sellPrice),
                imageUrl: (gp.game as any).imageUrl || null
            });
        } else {
            const game = gamesMap.get(company);
            if (Number(gp.sellPrice) < game.minPrice) {
                game.minPrice = Number(gp.sellPrice);
                game.id = gp.game.id;
            }
        }
    });

    // Serialize partner data
    const serializedPartner = {
        id: partner.id,
        name: partner.name,
        domain: partner.domain,
        logoUrl: partner.logoUrl,
        themeConfig: partner.themeConfig,
        walletBalance: Number(partner.walletBalance),
        subscriptionStatus: partner.subscriptionStatus,
        games: Array.from(gamesMap.values())
    }

    return serializedPartner
}
