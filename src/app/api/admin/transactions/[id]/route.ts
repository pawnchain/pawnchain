import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { assignUserToTriangle } from '@/lib/triangle'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    const { id } = await params
    const body = await request.json()
    const { status, rejectionReason } = body
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CONSOLIDATED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    // Get the transaction first
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update transaction
    const updateData: any = { 
      status,
      updatedAt: new Date()
    }

    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date()
    } else if (status === 'REJECTED') {
      updateData.rejectedAt = new Date()
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason
      }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: updateData
    })
    
    // Handle deposit confirmation
    if (status === 'CONFIRMED' && transaction.type === 'DEPOSIT') {
      // Update user status to CONFIRMED
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { status: 'CONFIRMED' }
      })

      // Assign user to triangle
      try {
        await assignUserToTriangle(transaction.userId, transaction.user.uplineId || undefined)
        console.log('User assigned to triangle successfully')
      } catch (assignError) {
        console.error('Failed to assign user to triangle:', assignError)
      }
      
      // Process referral bonus if user has an upline
      if (transaction.user.uplineId) {
        const plan = await prisma.plan.findUnique({
          where: { name: transaction.user.plan }
        })
        
        if (plan) {
          // Create referral bonus transaction
          await prisma.transaction.create({
            data: {
              userId: transaction.user.uplineId,
              type: 'REFERRAL_BONUS',
              amount: plan.referralBonus,
              status: 'CONFIRMED',
              transactionId: `RB${Date.now()}`,
              description: `Referral bonus for ${transaction.user.username}`
            }
          })
          
          // Update upline's balance and total earned
          await prisma.user.update({
            where: { id: transaction.user.uplineId },
            data: {
              balance: { increment: plan.referralBonus },
              totalEarned: { increment: plan.referralBonus }
            }
          })
        }
      }
    }

    // Handle deposit rejection - delete user account
    if (status === 'REJECTED' && transaction.type === 'DEPOSIT') {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          deletedAt: new Date(),
          isActive: false,
          username: `deleted_${transaction.userId}`,
          walletAddress: `deleted_${transaction.userId}`
        }
      })
    }

    // Handle withdrawal completion - delete user account
    if (status === 'COMPLETED' && transaction.type === 'WITHDRAWAL') {
      // Remove user from triangle position
      await prisma.trianglePosition.updateMany({
        where: { userId: transaction.userId },
        data: { userId: null }
      })

      // Soft delete user account
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          deletedAt: new Date(),
          isActive: false,
          username: `withdrawn_${transaction.userId}`,
          walletAddress: `withdrawn_${transaction.userId}`
        }
      })

      // Mark all user transactions as consolidated
      await prisma.transaction.updateMany({
        where: { userId: transaction.userId },
        data: { status: 'CONSOLIDATED' }
      })
      
      // TODO: We should invalidate the user's session here
      // This would require access to the session store or JWT invalidation
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