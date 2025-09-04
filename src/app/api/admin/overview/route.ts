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
    let activeTrianglesByPlan = [];
    let completedTrianglesByPlan = [];
    
    try {
      // Fetch all triangles and manually group them
      const allTriangles = await prisma.triangle.findMany({
        select: {
          planType: true,
          completedAt: true
        }
      });
      
      // Group triangles manually
      const trianglesByPlanMap = new Map();
      
      allTriangles.forEach(triangle => {
        const key = `${triangle.planType}-${triangle.completedAt ? 'completed' : 'active'}`;
        if (trianglesByPlanMap.has(key)) {
          trianglesByPlanMap.set(key, trianglesByPlanMap.get(key) + 1);
        } else {
          trianglesByPlanMap.set(key, 1);
        }
      });
      
      // Convert map to arrays
      activeTrianglesByPlan = Array.from(trianglesByPlanMap.entries())
        .filter(([key]) => key.endsWith('-active'))
        .map(([key, count]) => {
          const planType = key.replace('-active', '');
          return { planType, count };
        });
        
      completedTrianglesByPlan = Array.from(trianglesByPlanMap.entries())
        .filter(([key]) => key.endsWith('-completed'))
        .map(([key, count]) => {
          const planType = key.replace('-completed', '');
          return { planType, count };
        });
    } catch (error) {
      console.error('Error fetching triangle stats:', error);
      // If there's an error, we'll return empty arrays for triangle stats
      activeTrianglesByPlan = [];
      completedTrianglesByPlan = [];
    }
    
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
    });
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