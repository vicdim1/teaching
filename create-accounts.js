const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUsers() {
  try {
    console.log('👥 Setting up user accounts...\n')
    
    // Check existing users
    const existingUsers = await prisma.user.findMany()
    console.log(`Found ${existingUsers.length} existing user(s)`)
    
    if (existingUsers.length > 0) {
      console.log('\n📋 Existing users:')
      existingUsers.forEach(u => console.log(`   - ${u.email} (${u.name})`))
    }
    
    // Create your wife's account (main tutor)
    const wifeEmail = 'vichaar.dimlaye@gmail.com'
    const wifeUser = await prisma.user.findUnique({ where: { email: wifeEmail } })
    
    if (!wifeUser) {
      const hashedPassword = await bcrypt.hash('password123', 10)
      await prisma.user.create({
        data: {
          email: wifeEmail,
          password: hashedPassword,
          name: 'Vichaar Dimlaye'
        }
      })
      console.log(`\n✅ Created tutor account: ${wifeEmail}`)
    } else {
      console.log(`\n✅ Tutor account already exists: ${wifeEmail}`)
    }
    
    // Create your administrator account
    // REPLACE THIS EMAIL WITH YOUR EMAIL
    const adminEmail = 'admin@theclassroom.mu' // <-- CHANGE THIS TO YOUR EMAIL
    const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } })
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10) // <-- CHANGE THIS PASSWORD
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Administrator'
        }
      })
      console.log(`✅ Created admin account: ${adminEmail}`)
    } else {
      console.log(`✅ Admin account already exists: ${adminEmail}`)
    }
    
    console.log('\n🎉 User setup complete!')
    console.log('\n📋 Login Credentials:')
    console.log('\n👩‍🏫 Tutor Account:')
    console.log(`   Email: ${wifeEmail}`)
    console.log(`   Password: password123`)
    console.log('\n👨‍💼 Administrator Account:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: admin123`)
    console.log('\n⚠️  IMPORTANT: Change these passwords after first login!')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createUsers()
