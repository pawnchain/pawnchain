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

export async function POST(request: NextRequest) {
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json()
    const { userIds } = body
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      )
    }
    
    // Soft delete users - mark with deletedAt timestamp (same as withdrawal completion)
    for (const userId of userIds) {
      await prisma.user.update({
        where: { 
          id: userId,
          isAdmin: false // Ensure we don't delete admin users
        },
        data: {
          deletedAt: new Date(),
          isActive: false,
          username: `deleted_${userId}`,
          walletAddress: `deleted_${userId}`
        }
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${userIds.length} users` 
    })
  } catch (error) {
    console.error('Error bulk deleting users:', error)
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}