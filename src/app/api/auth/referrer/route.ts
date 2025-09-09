import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json(
        { error: 'Referrer code is required' },
        { status: 400 }
      )
    }
    
    // Try to find referrer by different methods
    const referrer = await prisma.user.findFirst({
      where: {
        OR: [
          { id: code.length === 24 ? code : undefined }, // Only if it looks like an ObjectId
          { username: code },
          { referralCode: code }
        ]
      },
      select: {
        id: true,
        username: true,
        plan: true
      }
    })
    
    if (!referrer) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(referrer)
  } catch (error) {
    console.error('Error finding referrer:', error)
    return NextResponse.json(
      { error: 'Failed to validate referrer' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}