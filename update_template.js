const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const partner = await prisma.partner.findFirst({
            where: { name: 'Test Game Store' }
        })

        if (partner) {
            console.log('Found partner:', partner.name, 'Current template:', partner.storeTemplate)

            await prisma.partner.update({
                where: { id: partner.id },
                data: { storeTemplate: 'TEMPLATE_COLORFUL' }
            })

            console.log('Updated partner template to TEMPLATE_COLORFUL')
        } else {
            console.log('Partner not found')
        }
    } catch (error) {
        console.error('Error:', error)
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
