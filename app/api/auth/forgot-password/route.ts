import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email/password-reset-email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    console.log('[Forgot Password] Request received for email:', email)

    if (!email) {
      console.log('[Forgot Password] No email provided')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    console.log('[Forgot Password] User found:', user ? `Yes (${user.email})` : 'No')

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      console.log('[Forgot Password] User not found, returning generic success message')
      return NextResponse.json({ 
        message: 'If an account exists with that email, you will receive a password reset link.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now
    
    console.log('[Forgot Password] Generated reset token:', resetToken.substring(0, 10) + '...')

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })
    
    console.log('[Forgot Password] Token saved to database')

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    
    console.log('[Forgot Password] Reset URL:', resetUrl)
    console.log('[Forgot Password] Attempting to send email to:', user.email)
    
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl)
      console.log('[Forgot Password] ✅ Email sent successfully!')
    } catch (emailError) {
      console.error('[Forgot Password] ❌ Failed to send email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send reset email. Please check your email configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'If an account exists with that email, you will receive a password reset link.' 
    })
  } catch (error) {
    console.error('[Forgot Password] ❌ Error:', error)
    return NextResponse.json(
      { error: `Failed to process password reset request: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
