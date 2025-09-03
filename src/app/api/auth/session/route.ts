import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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
      console.log('Session API - returning user:', decoded.user.username, 'isAdmin:', decoded.user.isAdmin)
      return NextResponse.json({ user: decoded.user })
    }
    
    console.log('Session API - No user in decoded token')
    return NextResponse.json({ user: null })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null })
  }
}