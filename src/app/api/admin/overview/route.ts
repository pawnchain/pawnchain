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
    // Fetch stats
    const totalUsers = await prisma.user.count()
    const activeTriangles = await prisma.triangle.count({
      where: { completedAt: null }
    })
    const pendingDeposits = await prisma.transaction.count({
      where: { 
        type: 'DEPOSIT',
        status: 'PENDING'
      }
    })
    const pendingPayouts = await prisma.transaction.count({
      where: { 
        type: 'PAYOUT',
        status: 'PENDING'
      }
    })
    
    // Calculate total revenue (sum of completed payouts)
    const completedPayouts = await prisma.transaction.findMany({
      where: { 
        type: 'PAYOUT',
        status: 'COMPLETED'
      },
      select: { amount: true }
    })
    
    const totalRevenue = completedPayouts.reduce((sum, tx) => sum + tx.amount, 0)
    
    // Fetch recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            plan: true
          }
        }
      }
    })
    
    const formattedRecentTransactions = recentTransactions.map(tx => ({
      id: tx.id,
      user: tx.user.username,
      type: tx.type.toLowerCase(),
      plan: tx.user.plan,
      amount: `${tx.amount} USDT`,
      status: tx.status.toLowerCase(),
      time: tx.createdAt.toISOString()
    }))
    
    // Fetch pending actions
    const pendingTransactions = await prisma.transaction.findMany({
      where: { 
        status: 'PENDING',
        OR: [
          { type: 'DEPOSIT' },
          { type: 'PAYOUT' }
        ]
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    })
    
    const pendingActions = pendingTransactions.map(tx => ({
      id: tx.id,
      type: tx.type === 'DEPOSIT' ? 'deposit_approval' : 'payout',
      user: tx.user.username,
      amount: `${tx.amount} USDT`,
      priority: tx.type === 'PAYOUT' ? 'high' : 'medium'
    }))
    
    // Fetch triangle stats by plan
    const trianglesByPlan = await prisma.triangle.groupBy({
      by: ['planType', 'completedAt'],
      _count: true
    })
    
    const activeTrianglesByPlan = trianglesByPlan
      .filter(t => t.completedAt === null)
      .map(t => ({
        planType: t.planType,
        count: t._count
      }))
      
    const completedTrianglesByPlan = trianglesByPlan
      .filter(t => t.completedAt !== null)
      .map(t => ({
        planType: t.planType,
        count: t._count
      }))
    
    return NextResponse.json({
      stats: {
        totalUsers,
        activeTriangles,
        pendingDeposits,
        pendingPayouts,
        totalRevenue
      },
      recentTransactions: formattedRecentTransactions,
      pendingActions,
      triangles: {
        active: activeTrianglesByPlan,
        completed: completedTrianglesByPlan
      }
    })
  } catch (error) {
    console.error('Error fetching admin overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin overview' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}