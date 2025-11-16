const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testForgotPassword() {
  try {
    console.log('Checking users in database...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    })
    
    console.log('Found users:')
    console.log(JSON.stringify(users, null, 2))
    
    if (users.length === 0) {
      console.log('\n⚠️  No users found in database!')
      console.log('Please create a user account first by registering at http://localhost:3000/register')
    } else {
      console.log('\n✅ You can test forgot password with these email addresses')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testForgotPassword()
