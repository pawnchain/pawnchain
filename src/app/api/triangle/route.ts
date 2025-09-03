import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { getUserTriangleInfo } from '@/lib/triangle'

const prisma = new PrismaClient()

// Helper function to verify user authentication
async function verifyUser(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    const decoded = jwt.verify(
      sessionToken,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as { user: any }
    
    if (decoded && decoded.user) {
      return decoded.user
    }
    
    return null
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User access required' },
        { status: 401 }
      )
    }

    const triangleInfo = await getUserTriangleInfo(user.id)
    
    if (!triangleInfo) {
      return NextResponse.json(
        { error: 'User not in any triangle' },
        { status: 404 }
      )
    }

    // Transform data for frontend compatibility
    const positions = Array(15).fill(null)
    
    triangleInfo.triangle.positions.forEach(pos => {
      const index = (pos.level - 1) * (pos.level === 1 ? 1 : pos.level === 2 ? 2 : pos.level === 3 ? 4 : 8) + pos.position
      if (pos.user) {
        positions[index] = {
          id: pos.user.id,
          username: pos.user.username,
          plan: pos.user.plan
        }
      }
    })

    const currentUserPosition = triangleInfo.triangle.positions.findIndex(pos => 
      pos.userId === user.id
    )

    return NextResponse.json({
      completion: triangleInfo.completion,
      positions,
      currentUserPosition: currentUserPosition >= 0 ? currentUserPosition : null,
      triangle: {
        id: triangleInfo.triangle.id,
        planType: triangleInfo.triangle.planType,
        isComplete: triangleInfo.triangle.isComplete,
        filledPositions: triangleInfo.filledPositions
      }
    })

  } catch (error) {
    console.error('Error fetching triangle data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch triangle data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}