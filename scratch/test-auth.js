const { auth } = require('./src/lib/auth')

async function main() {
  try {
    console.log('Testing Better Auth initialization...')
    // Just try to access something that triggers initialization
    console.log('Base URL:', auth.options.baseURL)
    console.log('Initialization successful.')
  } catch (error) {
    console.error('Initialization failed:', error)
  }
}

main()
