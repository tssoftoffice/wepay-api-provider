const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkData() {
    try {
        const totalTxns = await prisma.gameTopupTransaction.count()
        const successTxns = await prisma.gameTopupTransaction.count({
            where: { status: 'SUCCESS' }
        })
        const pendingTxns = await prisma.gameTopupTransaction.count({
            where: { status: 'PENDING' }
        })
        const failedTxns = await prisma.gameTopupTransaction.count({
            where: { status: 'FAILED' }
        })

        console.log('Total Transactions:', totalTxns)
        console.log('Success Transactions:', successTxns)
        console.log('Pending Transactions:', pendingTxns)
        console.log('Failed Transactions:', failedTxns)

        if (successTxns > 0) {
            const sample = await prisma.gameTopupTransaction.findFirst({
                where: { status: 'SUCCESS' }
            })
            console.log('Sample Success Txn:', sample)
        }
    } catch (error) {
        console.error('Error checking DB:', error)
    }
}

checkData()
