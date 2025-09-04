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
    // First ensure positions are properly ordered
    const orderedPositions = triangleInfo.triangle.positions
      .slice()
      .sort((a, b) => {
        // Sort by level first, then by position within level
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        return a.position - b.position;
      });

    // Create positions array with correct ordering
    const positions = orderedPositions.map(pos => {
      if (pos.user) {
        return {
          id: pos.user.id,
          username: pos.user.username,
          plan: pos.user.plan
        };
      }
      return null;
    });

    const currentUserPosition = orderedPositions.findIndex(pos => 
      pos.userId === user.id
    );

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