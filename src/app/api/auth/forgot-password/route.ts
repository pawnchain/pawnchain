import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, newPassword } = body

    // Validate wallet address
    if (!walletAddress) {
      return NextResponse.json(
        { message: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find user by wallet address
    const user = await prisma.user.findFirst({
      where: { walletAddress }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this wallet address' },
        { status: 404 }
      )
    }

    // If this is just a verification request (no new password provided)
    if (!newPassword) {
      return NextResponse.json({
        username: user.username,
        message: 'Account found'
      })
    }

    // This is a password reset request
    // Validate new password
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        loginAttempts: 0, // Reset login attempts
        lockedUntil: null // Unlock account if locked
      }
    })

    console.log('Password updated successfully for user:', user.username)

    return NextResponse.json({
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Failed to process password reset' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}