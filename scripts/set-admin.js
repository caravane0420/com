
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { username: 'caravane0420' },
    })

    if (!user) {
        console.log('User caravane0420 not found')
        return
    }

    const updated = await prisma.user.update({
        where: { username: 'caravane0420' },
        data: { role: 'ADMIN' },
    })

    console.log(`User caravane0420 updated to ADMIN:`, updated)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
