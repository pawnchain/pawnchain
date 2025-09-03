import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    })
    
    // Transform data for frontend
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId } = body
    
    // Update transaction status to indicate user has confirmed payment intent
    const updatedTransaction = await prisma.transaction.update({
      where: { transactionId },
      data: { 
        status: 'PENDING',
        // Could add a field to track when user confirmed payment intent
        confirmedAt: new Date()
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      transaction: updatedTransaction 
    })
  } catch (error) {
    console.error('Error confirming deposit:', error)
    return NextResponse.json(
      { error: 'Failed to confirm deposit' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}