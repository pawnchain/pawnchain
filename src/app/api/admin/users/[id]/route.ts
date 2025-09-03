import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Helper function to verify admin status
async function verifyAdmin(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    // Verify and decode the session token
    const decoded = jwt.verify(
      sessionToken,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as { user: any }
    
    if (decoded && decoded.user && decoded.user.isAdmin) {
      return decoded.user
    }
    
    return null
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

// GET /api/admin/users/:id - Get specific user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin status
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    const { id } = params
    
    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        upline: {
          select: {
            username: true
          }
        },
        referrals: {
          select: {
            username: true,
            plan: true,
            createdAt: true
          }
        },
        trianglePositions: {
          include: {
            triangle: true
          }
        },
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Transform data for frontend
    const formattedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      plan: user.plan,
      referralCode: user.referralCode,
      balance: user.balance,
      totalEarned: user.totalEarned,
      createdAt: user.createdAt.toISOString(),
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      upline: user.upline,
      referrals: user.referrals,
      trianglePositions: user.trianglePositions.map(pos => ({
        id: pos.id,
        position: pos.position,
        triangleId: pos.triangleId,
        triangle: pos.triangle
      })),
      transactions: user.transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        transactionId: tx.transactionId,
        createdAt: tx.createdAt.toISOString()
      }))
    }
    
    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH /api/admin/users/:id - Update user details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin status
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    const { id } = params
    const body = await request.json()
    const { action } = body
    
    // Validate action
    const validActions = ['suspend', 'activate', 'delete']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
    let updatedUser
    
    switch (action) {
      case 'suspend':
        updatedUser = await prisma.user.update({
          where: { id },
          data: { 
            isActive: false,
            loginAttempts: 5 // Set to max to indicate suspension
          }
        })
        break
        
      case 'activate':
        updatedUser = await prisma.user.update({
          where: { id },
          data: { 
            isActive: true,
            loginAttempts: 0 // Reset login attempts
          }
        })
        break
        
      case 'delete':
        // Soft delete - mark as inactive
        updatedUser = await prisma.user.update({
          where: { id },
          data: { 
            isActive: false,
            loginAttempts: 5
          }
        })
        break
    }
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}