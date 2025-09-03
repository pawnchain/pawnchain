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

export async function GET(request: NextRequest) {
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    // Fetch all triangles with position counts
    const triangles = await prisma.triangle.findMany({
      include: {
        positions: {
          include: {
            user: {
              select: {
                username: true,
                plan: true
              }
            }
          },
          orderBy: [
            { level: 'asc' },
            { position: 'asc' }
          ]
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data for frontend
    const formattedTriangles = triangles.map(triangle => {
      const filledPositions = triangle.positions.filter(p => p.userId).length
      const completion = (filledPositions / 15) * 100

      return {
        id: triangle.id,
        planType: triangle.planType,
        isComplete: triangle.isComplete,
        completion: completion.toFixed(1),
        filledPositions,
        totalPositions: 15,
        createdAt: triangle.createdAt.toISOString(),
        completedAt: triangle.completedAt?.toISOString() || null,
        payoutProcessed: triangle.payoutProcessed,
        positions: triangle.positions.map(pos => ({
          id: pos.id,
          positionKey: pos.positionKey,
          level: pos.level,
          position: pos.position,
          user: pos.user ? {
            username: pos.user.username,
            plan: pos.user.plan
          } : null
        }))
      }
    })
    
    return NextResponse.json(formattedTriangles)
  } catch (error) {
    console.error('Error fetching triangles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch triangles' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}