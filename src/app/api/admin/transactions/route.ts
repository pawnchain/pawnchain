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

// GET /api/admin/transactions - Get all transactions
export async function GET(request: NextRequest) {
  // Verify admin status
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    
    // Build where clause
    const where: any = {}
    if (type && type !== 'all') {
      where.type = type
    }
    if (status && status !== 'all') {
      where.status = status
    }
    
    // Fetch transactions with user information
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            plan: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Transform data for frontend
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      txHash: tx.transactionId || undefined,
      user: tx.user.username,
      plan: tx.user.plan,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      createdAt: tx.createdAt.toISOString()
    }))
    
    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}