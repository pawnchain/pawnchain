import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    console.log('Session API - sessionToken:', sessionToken ? 'Present' : 'Missing')
    
    if (!sessionToken) {
      console.log('Session API - No session token found, returning null user')
      return NextResponse.json({ user: null })
    }
    
    // Verify and decode the session token
    const decoded = jwt.verify(
      sessionToken,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as { user: any }
    
    console.log('Session API - decoded token:', decoded ? 'Valid' : 'Invalid')
    
    if (decoded && decoded.user) {
      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.user.id }
      })
      
      // If user doesn't exist or has been deleted, return null
      if (!user || !user.isActive) {
        console.log('Session API - User account inactive, returning null')
        // Clear the session cookie
        const response = NextResponse.json({ user: null })
        response.cookies.delete('next-auth.session-token')
        return response
      }
      
      // Check if user has a pending withdrawal
      const userWithTransactions = await prisma.user.findUnique({
        where: { id: decoded.user.id },
        include: {
          transactions: {
            where: {
              type: 'WITHDRAWAL',
              status: {
                in: ['PENDING', 'CONFIRMED']
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
      
      // Add withdrawal status to user object
      const userWithWithdrawalStatus = {
        ...decoded.user,
        hasPendingWithdrawal: userWithTransactions?.transactions && userWithTransactions.transactions.length > 0,
        withdrawalTransaction: userWithTransactions?.transactions?.[0] || null,
        // MARK: Added flag to indicate if user has completed a withdrawal
        hasCompletedWithdrawal: user?.hasCompletedWithdrawal || userWithTransactions?.transactions?.some(tx => tx.status === 'COMPLETED') || false
      }

      // Ensure trianglePosition is properly formatted
      if (userWithWithdrawalStatus.trianglePosition && typeof userWithWithdrawalStatus.trianglePosition === 'object') {
        // If trianglePosition is a complex object, we need to simplify it
        if (userWithWithdrawalStatus.trianglePosition.id) {
          // Keep only the position number for client-side use
          userWithWithdrawalStatus.trianglePosition = userWithWithdrawalStatus.trianglePosition.position || 0;
        } else {
          userWithWithdrawalStatus.trianglePosition = null;
        }
      }

      console.log('Session API - returning user:', userWithWithdrawalStatus.username, 'isAdmin:', userWithWithdrawalStatus.isAdmin)
      return NextResponse.json({ user: userWithWithdrawalStatus })
    }
    
    console.log('Session API - No user in decoded token')
    return NextResponse.json({ user: null })
  } catch (error) {
    console.error('Session error:', error)
    // Clear the session cookie on error
    const response = NextResponse.json({ user: null })
    response.cookies.delete('next-auth.session-token')
    return response
  } finally {
    await prisma.$disconnect()
  }
}
