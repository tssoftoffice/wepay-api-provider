
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Mock WePay Client or just fetch games? 
// Actually, to get "Available Products", I need WePay. 
// But I can also just Iterate EXISTING games and fix them based on their FaceValue if I assume faceValue is correct?
// Wait, FaceValue might be 0 for some games?
// Most games have FaceValue. 
// The user said "Prices are old". The old prices were "Cost > FaceValue".
// I can just loop through all games, and RE-CALCULATE providerPrice/baseCost based on faceValue.
// Formula: providerPrice = faceValue * 0.9475, baseCost = faceValue * 0.9625.
// This is much faster and doesn't need external API if FaceValue is reliable.
// FaceValue comes from `game.code` usually (e.g. mtopup_TRMV_50 -> 50).
// I will parse denomination from CODE to be safe, or use `faceValue` column.

async function main() {
    console.log('--- Force Syncing Prices to Standard Formula ---');

    const games = await prisma.game.findMany({
        where: { status: 'ACTIVE' }
    });

    console.log(`Found ${games.length} active games.`);

    let updatedCount = 0;

    for (const game of games) {
        let price = Number(game.faceValue);

        // Fallback: Parse from code if faceValue is 0 (some legacy data?)
        if (price === 0 && game.code) {
            const parts = game.code.split('_');
            const lastPart = parts[parts.length - 1];
            // Check if last part is a number
            if (!isNaN(parseFloat(lastPart))) {
                price = parseFloat(lastPart);
            }
        }

        if (price > 0) {
            // Standard Formula
            const newProviderPrice = Number((price * 0.9475).toFixed(4));
            const newBaseCost = Number((price * 0.9625).toFixed(4));

            // Check if update needed
            if (Math.abs(Number(game.providerPrice) - newProviderPrice) > 0.001 ||
                Math.abs(Number(game.baseCost) - newBaseCost) > 0.001) {

                await prisma.game.update({
                    where: { id: game.id },
                    data: {
                        providerPrice: newProviderPrice,
                        baseCost: newBaseCost,
                        faceValue: price // Ensure face value is set
                    }
                });
                updatedCount++;
                if (updatedCount % 50 === 0) process.stdout.write('.');
            }
        }
    }

    console.log(`\nUpdated ${updatedCount} games.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
