const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

async function main() {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const hashedPassword = await bcrypt.hash('password123', 12)
    const user = await prisma.user.create({
      data: {
        name: 'Hashed User',
        email: 'hashed@example.com',
        password: hashedPassword
      }
    })
    console.log('Created user:', user.id)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
