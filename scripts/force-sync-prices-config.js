
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Manually define the rates here since we can't easily import TS modules in a simple JS script without ts-node or build steps.
// This duplicates logic but ensures immediate execution. 
// Actually, I can try to require the TS file if using ts-node, but user env might not support it easily.
// Safer to COPY the rate table into this script for the one-time fix.

// Copied from src/config/pricing.ts
function createRate(discountPercent) {
    const costRatio = 1 - (discountPercent / 100)
    const priceRatio = costRatio + 0.015 // 1.5% Admin Margin
    return {
        costRatio: Number(costRatio.toFixed(4)),
        priceRatio: Number(priceRatio.toFixed(4))
    }
}

const DEFAULT_RATE = { costRatio: 0.98, priceRatio: 0.995 };

const CATEGORY_RATES = {
    'mtopup': createRate(0.5),
    'gtopup': createRate(5),
    'cashcard': createRate(1.5),
    'billpay': createRate(0)
};

const SPECIAL_RATES = {
    'AIS': createRate(1),
    'DTAC': createRate(3),
    'TRUEMOVE': createRate(3),
    'MY': createRate(3.5),
    'MY-AOP': createRate(4),
    'AIS-AOP': createRate(1.5),
    'HAPPY-AOP': createRate(4),
    'TRMV-AOP': createRate(4),
    'FREEFIRE': createRate(5.25),
    'ROV-M': createRate(5.25),
    'MLBB': createRate(9),
    'SWOJTC': createRate(21),
    'WWM': createRate(8.5),
    'VALORANT-D': createRate(5),
    'DELTAFORCE': createRate(24),
    'GRN-DTF': createRate(5.25),
    'PUBGM': createRate(13),
    'PUBGM-D': createRate(15),
    'PUBGM-RAZER': createRate(12.5),
    'SKRE': createRate(13),
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
    'G78NAGB': createRate(16),
    'LOR': createRate(5),
    'WILDRIFT': createRate(5),
    'DRAGONRAJA': createRate(18.5),
    'CTSIDE': createRate(8.5),
    'EOSRED': createRate(8.5),
    'TRUEMONEY': createRate(2.5),
    'GARENA': createRate(3.5),
    'GEFORCENOW': createRate(12.5),
    'GFNOW-SG': createRate(9),
    'RIOT': createRate(11),
    'MOL': createRate(4.5),
    'ROBLOX': createRate(8),
    'STEAM': createRate(4),
    'ASIASOFT': createRate(2),
    'ASIASOFT-F': createRate(2),
    'STARBUCKS': createRate(10),
    'PSN': createRate(5),
    'NINTENDO': createRate(0),
    'EX': createRate(8),
    'GAMEINDY': createRate(6),
    'LINE': createRate(3.5),
    'BNET': createRate(15)
};

function getPricingRate(type, code) {
    if (SPECIAL_RATES[code]) return SPECIAL_RATES[code];
    const parts = code.split('_');
    if (parts.length >= 2) {
        const companyId = parts[1];
        if (SPECIAL_RATES[companyId]) return SPECIAL_RATES[companyId];
    }
    if (CATEGORY_RATES[type]) return CATEGORY_RATES[type];
    return DEFAULT_RATE;
}

async function main() {
    console.log('--- Force Syncing Prices with Granular Config ---');

    const games = await prisma.game.findMany({
        where: { status: 'ACTIVE' }
    });

    console.log(`Found ${games.length} active games.`);

    let updatedCount = 0;

    for (const game of games) {
        let price = Number(game.faceValue);

        if (price === 0 && game.code) {
            const parts = game.code.split('_');
            const lastPart = parts[parts.length - 1];
            if (!isNaN(parseFloat(lastPart))) {
                price = parseFloat(lastPart);
            }
        }

        if (price > 0) {
            const code = game.code || '';
            const type = code.split('_')[0] || 'gtopup'; // infer type from code prefix

            const { costRatio, priceRatio } = getPricingRate(type, code);

            const newProviderPrice = Number((price * costRatio).toFixed(4));
            const newBaseCost = Number((price * priceRatio).toFixed(4)); // Partner Price

            // Update if changed
            if (Math.abs(Number(game.providerPrice) - newProviderPrice) > 0.001 ||
                Math.abs(Number(game.baseCost) - newBaseCost) > 0.001) {

                await prisma.game.update({
                    where: { id: game.id },
                    data: {
                        providerPrice: newProviderPrice,
                        baseCost: newBaseCost,
                        faceValue: price
                    }
                });
                updatedCount++;
                if (updatedCount % 50 === 0) process.stdout.write('.');
            }
        }
    }

    console.log(`\nUpdated ${updatedCount} games with new config.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
