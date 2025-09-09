import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { assignUserToTriangle } from '@/lib/triangle'

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

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User access required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { plan, referrerId } = body
    
    // Validate plan
    const planExists = await prisma.plan.findUnique({
      where: { name: plan }
    })
    
    if (!planExists) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }
    
    // If user provided a referrer, validate it
    let referrer = null
    if (referrerId) {
      // MARK: Fixed the query to use findFirst instead of findUnique for OR conditions
      referrer = await prisma.user.findFirst({
        where: {
          OR: [
            { id: referrerId },
            { username: referrerId },
            { referralCode: referrerId }
          ]
        }
      })
      
      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referrer code' },
          { status: 400 }
        )
      }
      
      // If referrer exists, user must select the same plan as referrer
      if (referrer.plan !== plan) {
        return NextResponse.json(
          { error: `You must select the same plan as your referrer (${referrer.plan})` },
          { status: 400 }
        )
      }
    }
    
    // Check if user is already in a triangle
    const existingPosition = await prisma.trianglePosition.findFirst({
      where: { 
        userId: user.id,
        triangle: {
          isComplete: false
        }
      },
      include: { triangle: true }
    })
    
    if (existingPosition) {
      return NextResponse.json(
        { error: 'You are already assigned to a triangle' },
        { status: 400 }
      )
    }
    
    // Assign user to triangle using the existing logic
    const position = await assignUserToTriangle(user.id, referrer?.id)
    
    return NextResponse.json({
      success: true,
      position: position
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