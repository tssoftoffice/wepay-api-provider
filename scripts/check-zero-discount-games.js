
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking for Zero-Discount Games ---');

    const games = await prisma.game.findMany({
        where: {
            status: 'ACTIVE'
        }
    });

    const noWePayDiscount = [];
    const noPartnerDiscount = [];

    for (const game of games) {
        const faceValue = Number(game.faceValue);
        const providerPrice = Number(game.providerPrice);
        const baseCost = Number(game.baseCost);

        if (faceValue <= 0) continue; // Skip if faceValue is invalid or variable

        // Check WePay Discount (providerPrice vs faceValue)
        if (providerPrice >= faceValue) {
            noWePayDiscount.push({
                code: game.code,
                name: game.name,
                face: faceValue,
                wePayCost: providerPrice,
                diff: (faceValue - providerPrice).toFixed(2)
            });
        }

        // Check Partner Discount (baseCost vs faceValue)
        if (baseCost >= faceValue) {
            noPartnerDiscount.push({
                code: game.code,
                name: game.name,
                face: faceValue,
                partnerCost: baseCost,
                diff: (faceValue - baseCost).toFixed(2)
            });
        }
    }

    console.log(`\n=== No WePay Discount (Cost >= FaceValue) [Total: ${noWePayDiscount.length}] ===`);
    if (noWePayDiscount.length > 0) {
        console.table(noWePayDiscount);
    } else {
        console.log("None. All games have WePay discount.");
    }

    console.log(`\n=== No Partner Discount (Partner Price >= FaceValue) [Total: ${noPartnerDiscount.length}] ===`);
    if (noPartnerDiscount.length > 0) {
        console.table(noPartnerDiscount);
    } else {
        console.log("None. All games have Partner discount.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
