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
        { error: 'User has not joined any triangle yet' },
        { status: 404 }
      )
    }

    // Transform positions for frontend
    const positions = triangleInfo.triangle.positions.map(pos => ({
      id: pos.id,
      positionKey: pos.positionKey,
      username: pos.user?.username || null,
      planType: pos.user?.plan || null,
      level: pos.level,
      position: pos.position
    }))

    const responseData = {
      triangle: {
        id: triangleInfo.triangle.id,
        planType: triangleInfo.triangle.planType,
        isComplete: triangleInfo.triangle.isComplete,
        positions
      },
      positionKey: triangleInfo.userPosition.positionKey,
      completion: triangleInfo.completion,
      filledPositions: triangleInfo.filledPositions
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching user position:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user position data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}