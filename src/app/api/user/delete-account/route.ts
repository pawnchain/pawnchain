import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, reason } = body
    
    // Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        transactionId: transactionId
      },
      include: {
        user: true
      }
    })
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    
    // Check if the transaction was rejected
    if (transaction.status !== 'REJECTED') {
      return NextResponse.json(
        { error: 'Account can only be deleted for rejected transactions' },
        { status: 400 }
      )
    }
    
    // Delete the user account
    await prisma.user.delete({
      where: {
        id: transaction.userId
      }
    })
    
    // Log the deletion
    console.log(`User account deleted due to rejected transaction: ${transaction.userId}`, {
      transactionId,
      reason
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}