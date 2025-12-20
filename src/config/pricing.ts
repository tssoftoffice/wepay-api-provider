
// Pricing Configuration
// Defines the "Cost" (WePay Discount) and "Price" (Partner Sell Price) ratios.
// Ratio 0.9475 means 5.25% Discount (100 * 0.9475 = 94.75)

export interface PricingRate {
    costRatio: number    // WePay Cost Ratio (e.g. 0.9475)
    priceRatio: number   // Partner Base Price Ratio (e.g. 0.9625)
}

export const DEFAULT_RATE: PricingRate = {
    costRatio: 0.98, // Default 2% discount if unknown
    priceRatio: 0.995 // Default 1.5% profit margin
}

// Helper to calculate ratios with 1.5% margin for Admin
function createRate(discountPercent: number, capAtFace = false): PricingRate {
    const costRatio = 1 - (discountPercent / 100)
    let priceRatio = costRatio + 0.015 // 1.5% Admin Margin

    // Optional: Cap at Face Value (1.0) if margin allows positive profit
    if (capAtFace && priceRatio > 1.0 && costRatio < 1.0) {
        priceRatio = 1.0
    }

    return {
        costRatio: Number(costRatio.toFixed(4)),
        priceRatio: Number(priceRatio.toFixed(4))
    }
}

// Category-based Rates
export const CATEGORY_RATES: Record<string, PricingRate> = {
    'mtopup': createRate(0.5, true), // Fallback Mobile 0.5% -> Cap at 1.0
    'gtopup': createRate(5),   // Fallback Game 5%
    'cashcard': createRate(1.5),// Fallback Card 1.5%
    'billpay': createRate(0)    // Fallback Bill 0%
}

// Specific Game Overrides (Key: Company ID from WePay)
// Mapping based on user list and inspection results
export const SPECIAL_RATES: Record<string, PricingRate> = {
    // === Mobile Topup ===
    'AIS': createRate(1, true), // Cap at 1.0 (Admin takes 1% margin)
    'DTAC': createRate(3),
    'TRUEMOVE': createRate(3),
    'TRMV': createRate(3), // Add TRMV mapping (TrueMove H)
    'MY': createRate(3.5),
    'MY-AOP': createRate(4), // My By Cat Promo

    // Mobile Promo Packages
    'AIS-AOP': createRate(1.5, true),
    'HAPPY-AOP': createRate(4), // Dtac Promo
    'TRMV-AOP': createRate(4),  // True Promo

    // === Game Topup ===
    'FREEFIRE': createRate(5.25),
    'ROV-M': createRate(5.25),
    'MLBB': createRate(9),
    'SWOJTC': createRate(21),
    'WWM': createRate(8.5),
    'VALORANT-D': createRate(5),
    'DELTAFORCE': createRate(24), // Steam
    'GRN-DTF': createRate(5.25),  // Garena
    'PUBGM': createRate(13),      // Global
    'PUBGM-D': createRate(15),    // Thai
    'PUBGM-RAZER': createRate(12.5), // UC Station
    'SKRE': createRate(13),       // Seven Knights
    'BIGOLIVE': createRate(7),
    'RCMASTER': createRate(20),
    'HOKINGS': createRate(10),
    'DUNKCITY': createRate(16),
    'COD-M': createRate(5.25),
    'BLOODSTRK': createRate(33.5),
    'IDENTITYV': createRate(17),
    'LOL': createRate(5),
    'HAIKYUFH': createRate(9.75),
    'RO-M-CSC': createRate(12.5),
    'LDSPACE': createRate(9),
    'AFKJOURNEY': createRate(5),
    'METALSLUG': createRate(5),
    'ARENABO': createRate(25),
    'GENSHIN': createRate(24),
    'ZZZERO': createRate(24),
    'HONKAISR': createRate(24),
    'DRAGONN-MC': createRate(25),
    'MPS-RE': createRate(6),
    'UNDAWN': createRate(5.25),
    'FIFA-M': createRate(7.5),
    'DIABLO-IV': createRate(12.5),
    'TFTACTICS': createRate(5),
    'ROO': createRate(13),
    'SEAL-M': createRate(18.5),
    'ROX': createRate(18.5),
    'HARRYPAWK': createRate(23.5),
    'ACERACER': createRate(19),
    'MU3-M': createRate(9),
    'DIABLO-IMM': createRate(15.5),
    'SAUSAGE': createRate(18.5),
    'SUPERSUS': createRate(7),
    'MARVELSNAP': createRate(13),
    'XHERO': createRate(18.5),
    'NIKKE': createRate(18.5),
    'OVERWATCH2': createRate(12.5),
    'RO-M': createRate(13),
    'MUAA': createRate(8.5),
    'G78NAGB': createRate(16), // Onmyoji
    'LOR': createRate(5),
    'WILDRIFT': createRate(5),
    'DRAGONRAJA': createRate(18.5),
    'CTSIDE': createRate(8.5),
    'EOSRED': createRate(8.5),

    // === Cash Cards ===
    'TRUEMONEY': createRate(2.5),
    'GARENA': createRate(3.5),
    'GEFORCENOW': createRate(12.5),
    'GFNOW-SG': createRate(9),
    'RIOT': createRate(11),
    'MOL': createRate(4.5), // Razer Gold
    'ROBLOX': createRate(8),
    'STEAM': createRate(4),
    'ASIASOFT': createRate(2), // @Cash
    'ASIASOFT-F': createRate(2),
    'STARBUCKS': createRate(10),
    'PSN': createRate(5),
    'NINTENDO': createRate(0), // 0% Discount
    'EX': createRate(8), // EX Cash
    'GAMEINDY': createRate(6),
    'LINE': createRate(3.5),
    'BNET': createRate(15)
}

export function getPricingRate(type: string, code: string): PricingRate {
    // WePay code format is usually: type_companyId_price (e.g. mtopup_AIS_50)

    // Attempt 1: Check Specific Code as key (if passed properly)
    if (SPECIAL_RATES[code]) return SPECIAL_RATES[code]

    // Attempt 2: Parse Company ID from stored Game Code
    // Format: "mtopup_AIS_50" or "gtopup_FREEFIRE_100"
    const parts = code.split('_')
    if (parts.length >= 2) {
        // parts[1] is usually companyId
        const companyId = parts[1]

        // Handle "AIS-AOP" which might be "mtopup_AIS-AOP_20" (parts[1] = AIS-AOP)
        // Or "mtopup_HAPPY-AOP_20"

        if (SPECIAL_RATES[companyId]) return SPECIAL_RATES[companyId]
    }

    // Attempt 3: Category Match
    if (CATEGORY_RATES[type]) return CATEGORY_RATES[type]

    // 4. Default
    return DEFAULT_RATE
}
