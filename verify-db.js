const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUser() {
  try {
    console.log('🔍 Checking database connection...\n')
    
    // Test connection and check existing users
    const existingUsers = await prisma.user.findMany()
    console.log(`Found ${existingUsers.length} existing user(s)`)
    
    if (existingUsers.length > 0) {
      console.log('\n📋 Existing users:')
      existingUsers.forEach(u => console.log(`   - ${u.email} (${u.name})`))
      console.log('\n✅ Database is working! User already exists.')
      return
    }
    
    console.log('\n🔑 Creating new user...')
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const user = await prisma.user.create({
      data: {
        email: 'vichaar.dimlaye@gmail.com',
        password: hashedPassword,
        name: 'Vichaar Dimlaye'
      }
    })
    
    console.log('\n✅ User created successfully!')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Password: password123`)
    console.log('\n🎉 Database is set up and ready!')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\nFull error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
