
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Restoring Historical Data Integrity ---');

    const txnId = '9f30e28a-f7d3-4492-92c2-859986c4a056';
    const originalBaseCost = 9.625;

    // Verify current state
    const tx = await prisma.gameTopupTransaction.findUnique({
        where: { id: txnId }
    });

    if (!tx) {
        console.log('Transaction not found!');
        return;
    }

    console.log(`Current State of Txn ${txnId}:`);
    console.log(`  baseCost (Partner Price): ${tx.baseCost}`);
    console.log(`  providerPrice (WePay Cost): ${tx.providerPrice}`);

    // Revert baseCost to original historical value
    // The user stated: "Partner cost for Free Fire was 9.625" (meaning baseCost)
    // My previous script might have bumped it to 9.77.
    // I need to set it back to 9.625.

    if (Number(tx.baseCost) !== originalBaseCost) {
        console.log(`\nReverting baseCost to ${originalBaseCost}...`);
        await prisma.gameTopupTransaction.update({
            where: { id: txnId },
            data: {
                baseCost: originalBaseCost
            }
        });
        console.log('  -> Done.');
    } else {
        console.log('\nbaseCost is already 9.625. No action needed.');
    }

    // Also verifying providerPrice is correct (9.475) from my last fix.
    // If it is 9.475 and baseCost is 9.625, then Profit = 0.15.
    // Wait, if Profit = 0.15, that is NOT negative.
    // User said "Profit is also negative".
    // Maybe "Profit" on dashboard is calculated as Revenue (Partner Price) - Cost (WePay).
    // If Partner Price = 9.625 and WePay = 9.475, Profit = 0.15.

    // IF the user saw "negative profit", it means WePay Cost > Partner Price.
    // Before my last fix, I had WePay Cost (displayed) = 9.625 (actually baseCost value in wrong column).
    // And Partner Price (displayed) = 9.475 (actually providerPrice value in wrong column).
    // So displayed profit was 9.475 - 9.625 = -0.15.

    // So essentially, the "Negative Profit" was purely a UI artifacts of SWAPPED COLUMNS.
    // But now I've fixed the UI columns.

    // However, I still need to make sure the DATA is historically accurate.
    // If the user says "Partner cost was 9.625", then baseCost MUST be 9.625.

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
