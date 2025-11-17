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
    
    // Create your wife's tutor account
    const wifeEmail = 'theclassroommru@gmail.com'
    const wifePassword = 'classroom2025!' // Temporary password - she should change it
    const wifeUser = await prisma.user.findUnique({ where: { email: wifeEmail } })
    
    if (!wifeUser) {
      const hashedPassword = await bcrypt.hash(wifePassword, 10)
      await prisma.user.create({
        data: {
          email: wifeEmail,
          password: hashedPassword,
          name: 'The Classroom Mauritius'
        }
      })
      console.log(`\n✅ Created tutor account: ${wifeEmail}`)
    } else {
      console.log(`\n✅ Tutor account already exists: ${wifeEmail}`)
      console.log(`   Updating password to: ${wifePassword}`)
      const hashedPassword = await bcrypt.hash(wifePassword, 10)
      await prisma.user.update({
        where: { email: wifeEmail },
        data: { 
          password: hashedPassword,
          name: 'The Classroom Mauritius'
        }
      })
      console.log(`✅ Password updated successfully!`)
    }
    
    // Create your administrator account
    const adminEmail = 'vichaar.dimlaye@gmail.com'
    const adminPassword = 'testpass1234!'
    const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } })
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
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
      console.log(`   Updating password to: ${adminPassword}`)
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      })
      console.log(`✅ Password updated successfully!`)
    }
    
    console.log('\n🎉 User setup complete!')
    console.log('\n📋 Login Credentials:')
    console.log('\n�‍💼 Administrator Account (You):')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('\n�‍🏫 Tutor Account (Your Wife):')
    console.log(`   Email: ${wifeEmail}`)
    console.log(`   Password: ${wifePassword}`)
    console.log('\n⚠️  IMPORTANT: Have your wife change her password after first login!')
    console.log('   Use the "Forgot Password" link on the login page.')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createUsers()
