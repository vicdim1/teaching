const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanup() {
  try {
    // Delete temporary wife account
    await prisma.user.delete({
      where: { email: 'wife@theclassroom.mu' }
    })
    console.log('✅ Deleted temporary account: wife@theclassroom.mu')
    
    // Show final accounts
    const users = await prisma.user.findMany()
    console.log('\n📋 Final user list:')
    users.forEach(u => console.log(`   - ${u.email} (${u.name})`))
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

cleanup()
