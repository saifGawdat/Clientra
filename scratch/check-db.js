const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

async function main() {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    const users = await prisma.user.findMany({ take: 1 })
    console.log('First user:', users[0] ? { ...users[0], password: '[HIDDEN]' } : 'None')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
