import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const csrfToken = formData.get('csrfToken') as string
    const redirect = formData.get('redirect') as string

    console.log('Login attempt:', { username, redirect })

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { username }
    })

    console.log('User lookup result:', user ? 'Found' : 'Not found', user?.id)

    if (!user) {
      console.log('User not found in database for username:', username)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: 'Account is temporarily locked. Please try again later.' },
        { status: 401 }
      )
    }

    // Verify password
    console.log('Comparing passwords...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Password comparison result:', isPasswordValid)

    if (!isPasswordValid) {
      // Increment login attempts
      const attempts = user.loginAttempts + 1
      const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedUntil: lockUntil
        }
      })

      console.log('Invalid password for user:', username, 'attempts:', attempts)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null
        }
      })
    }

    // Create session user object
    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      plan: user.plan,
      trianglePosition: user.trianglePosition,
      triangleId: user.triangleId,
      referralCode: user.referralCode,
      uplineId: user.uplineId,
      balance: user.balance,
      totalEarned: user.totalEarned,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    }

    // Create a session token
    const sessionToken = jwt.sign(
      { user: sessionUser },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    )

    // Set session cookie
    const response = NextResponse.json({
      ok: true,
      url: '/',
      user: sessionUser
    })

    response.cookies.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })

    console.log('Login successful for user:', user.username, 'isAdmin:', user.isAdmin)
    console.log('Setting cookie with token length:', sessionToken.length)
    console.log('Cookie settings - secure:', process.env.NODE_ENV === 'production', 'sameSite: lax')

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}