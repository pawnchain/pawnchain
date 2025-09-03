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

// PATCH /api/admin/transactions/:id - Update transaction status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin status
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body
    
    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CONSOLIDATED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { status }
    })
    
    // NEW: If transaction is confirmed and it's a deposit, assign user to triangle
    if (status === 'CONFIRMED' && updatedTransaction.type === 'DEPOSIT') {
      try {
        // Call the triangle assignment API
        const assignResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/triangle/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({ userId: updatedTransaction.userId })
        })
        
        if (!assignResponse.ok) {
          console.error('Failed to assign user to triangle:', await assignResponse.text())
        }
      } catch (assignError) {
        console.error('Error assigning user to triangle:', assignError)
      }
      
      // Process referral bonus if user has an upline
      const user = await prisma.user.findUnique({
        where: { id: updatedTransaction.userId },
        include: { upline: true }
      })
      
      if (user && user.uplineId) {
        // Get plan details for referral bonus amount
        const plan = await prisma.plan.findUnique({
          where: { name: user.plan }
        })
        
        if (plan) {
          // Create referral bonus transaction
          await prisma.transaction.create({
            data: {
              userId: user.uplineId,
              type: 'REFERRAL',
              amount: plan.referralBonus,
              status: 'CONFIRMED',
              transactionId: `RB${Date.now()}`
            }
          })
          
          // Update upline's balance and total earned
          await prisma.user.update({
            where: { id: user.uplineId },
            data: {
              balance: {
                increment: plan.referralBonus
              },
              totalEarned: {
                increment: plan.referralBonus
              }
            }
          })
        }
      }
    }
    
    // If transaction is completed and it's a payout, update user balance
    if (status === 'COMPLETED' && updatedTransaction.type === 'PAYOUT') {
      const user = await prisma.user.findUnique({
        where: { id: updatedTransaction.userId }
      })
      
      if (user) {
        await prisma.user.update({
          where: { id: updatedTransaction.userId },
          data: {
            balance: {
              decrement: updatedTransaction.amount
            },
            totalEarned: {
              increment: updatedTransaction.amount
            }
          }
        })
      }
    }
    
    // If transaction is completed and it's a deposit, update user balance
    if (status === 'COMPLETED' && updatedTransaction.type === 'DEPOSIT') {
      const user = await prisma.user.findUnique({
        where: { id: updatedTransaction.userId }
      })
      
      if (user) {
        await prisma.user.update({
          where: { id: updatedTransaction.userId },
          data: {
            balance: {
              increment: updatedTransaction.amount
            }
          }
        })
      }
    }
    
    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}