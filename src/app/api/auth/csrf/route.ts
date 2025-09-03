import { NextRequest, NextResponse } from 'next/server'
import { getCsrfToken } from 'next-auth/react'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    // Generate a CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex')
    
    return NextResponse.json({ csrfToken })
  } catch (error) {
    console.error('CSRF error:', error)
    return NextResponse.json({ csrfToken: 'fallback-csrf-token' })
  }
}