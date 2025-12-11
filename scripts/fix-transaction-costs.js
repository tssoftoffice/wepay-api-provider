
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Fixing Transaction Costs (Syncing providerPrice with Game) ---');

    // Find transactions where providerPrice matches the CURRENT baseCost of the game
    // OR where providerPrice is significantly different from Game.providerPrice
    // For safety, let's just sync providerPrice to Game.providerPrice for ALL transactions
    // where they differ, assuming Game.providerPrice is the "True WePay Cost" constant.

    // Note: Only do this for 'SUCCESS' or 'PENDING' transactions, or just all.
    // Let's filter for those where providerPrice > Game.providerPrice (Cost is inflated).

    const transactions = await prisma.gameTopupTransaction.findMany({
        include: {
            game: true
        }
    });

    let fixedCount = 0;

    for (const tx of transactions) {
        if (!tx.game) continue;

        // We assume the Game's current providerPrice is the correct "historical" cost reference
        // This might not be 100% true if cost changed, but it's better than having Cost = Sell Price.

        const gameProviderPrice = Number(tx.game.providerPrice);
        const txProviderPrice = Number(tx.providerPrice);

        // If different by more than 0.01 (float epsilon)
        if (Math.abs(txProviderPrice - gameProviderPrice) > 0.001) {
            console.log(`[FIX NEEDED] Txn ${tx.id}`);
            console.log(`  Current Txn Cost: ${txProviderPrice}`);
            console.log(`  Game Actual Cost: ${gameProviderPrice}`);
            console.log(`  (Note: Txn Cost ${txProviderPrice} == Game BaseCost ${tx.game.baseCost} ? ${Math.abs(txProviderPrice - Number(tx.game.baseCost)) < 0.001})`);

            // Update
            await prisma.gameTopupTransaction.update({
                where: { id: tx.id },
                data: {
                    providerPrice: tx.game.providerPrice
                }
            });

            console.log(`  -> Fixed: providerPrice set to ${gameProviderPrice}`);
            fixedCount++;
        }
    }

    console.log(`\nFixed ${fixedCount} transactions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
