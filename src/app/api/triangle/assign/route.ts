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

// Function to find or create a triangle for a user
async function findOrCreateTriangleForUser(userId: string) {
  try {
    // Get the user with their upline and plan information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        upline: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // 1. If user has an upline, try to place them in the same triangle as their upline
    if (user.uplineId) {
      // Find positions of the upline in incomplete triangles
      const uplinePositions: any = await (prisma as any).position.findMany({
        where: {
          userId: user.uplineId,
          triangle: {
            completedAt: null
          }
        },
        include: {
          triangle: true
        }
      })

      if (uplinePositions && uplinePositions.length > 0) {
        // Try to place user in the same triangle as their upline
        const uplineTriangle = uplinePositions[0].triangle
        
        // Check if the triangle is the same plan type
        if (uplineTriangle && uplineTriangle.planType === user.plan) {
          const position: any = await assignUserToTriangle(user.id, uplineTriangle.id)
          if (position) {
            return position
          }
        }
      }
    }

    // 2. Find the oldest available incomplete triangle of the same plan type
    // First, get all triangles of the same plan type
    const allTriangles: any = await prisma.triangle.findMany({
      where: {
        planType: user.plan,
        completedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Try to assign user to one of these triangles
    for (const triangle of allTriangles) {
      const position: any = await assignUserToTriangle(user.id, triangle.id)
      if (position) {
        return position
      }
    }

    // 3. If no available triangle, create a new one
    const newTriangle: any = await prisma.triangle.create({
      data: {
        planType: user.plan,
        positions: [] // Initialize as empty array
      }
    })

    // Create the first position and assign the user to it
    const position: any = await (prisma as any).position.create({
      data: {
        triangleId: newTriangle.id,
        position: 0,
        userId: user.id
      }
    })

    // Update user with their triangle position
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        trianglePosition: 0,
        triangleId: newTriangle.id
      }
    })

    return position
  } catch (error) {
    console.error('Error finding or creating triangle for user:', error)
    throw error
  }
}

// Function to assign a user to a specific triangle
async function assignUserToTriangle(userId: string, triangleId: string) {
  try {
    // Find the first available position in the triangle
    const availablePosition: any = await (prisma as any).position.findFirst({
      where: {
        triangleId: triangleId,
        userId: null
      },
      orderBy: {
        position: 'asc'
      }
    })

    if (availablePosition) {
      // Assign user to this position
      const updatedPosition: any = await (prisma as any).position.update({
        where: {
          id: availablePosition.id
        },
        data: {
          userId: userId
        }
      })

      // Update user with their triangle position
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          trianglePosition: updatedPosition.position,
          triangleId: triangleId
        }
      })

      return updatedPosition
    }

    return null
  } catch (error) {
    console.error('Error assigning user to triangle:', error)
    throw error
  }
}

// POST /api/triangle/assign - Assign a user to a triangle when their deposit is confirmed
export async function POST(request: NextRequest) {
  // Verify admin status
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Assign user to a triangle
    const position: any = await findOrCreateTriangleForUser(userId)
    
    if (!position) {
      return NextResponse.json(
        { error: 'Failed to assign user to triangle' },
        { status: 500 }
      )
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'User successfully assigned to triangle',
      position: {
        id: position.id,
        position: position.position,
        triangleId: position.triangleId
      }
    })
  } catch (error) {
    console.error('Error assigning user to triangle:', error)
    return NextResponse.json(
      { error: 'Failed to assign user to triangle' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}