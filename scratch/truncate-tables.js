const { Pool } = require('pg')

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    console.log('Truncating all tables...')
    await pool.query('TRUNCATE TABLE "User", "Account", "Session", "Verification", "Contact", "Company", "Deal", "Activity", "Note" CASCADE')
    console.log('Truncated successfully.')
  } catch (error) {
    console.error('Error truncating:', error)
  } finally {
    await pool.end()
  }
}

main()
