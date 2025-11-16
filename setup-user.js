const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check existing users
    const users = await prisma.user.findMany()
    console.log('\n=== Current Users in Database ===')
    if (users.length === 0) {
      console.log('No users found!')
    } else {
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email})`)
      })
    }
    
    // Create a test user if none exists
    if (users.length === 0) {
      console.log('\n=== Creating Test User ===')
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      const newUser = await prisma.user.create({
        data: {
          email: 'vichaar.dimlaye@gmail.com',
          password: hashedPassword,
          name: 'Vichaar Dimlaye'
        }
      })
      
      console.log('✅ Test user created successfully!')
      console.log(`Email: ${newUser.email}`)
      console.log(`Password: password123`)
      console.log('\nYou can now:')
      console.log('1. Login with these credentials at http://localhost:3000/login')
      console.log('2. Test forgot password at http://localhost:3000/forgot-password')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
