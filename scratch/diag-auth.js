require('dotenv').config()
const { auth } = require('./src/lib/auth')

async function test() {
  try {
    console.log('Testing Better Auth getSession...')
    const session = await auth.api.getSession({
      headers: new Headers()
    })
    console.log('Session check successful:', session)
  } catch (error) {
    console.error('Better Auth error:', error)
  }
}

test()
