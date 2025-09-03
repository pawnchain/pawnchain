import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, hash } = body

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Compare the provided password with the provided hash
    const isMatch = await bcrypt.compare(password, hash)
    
    return NextResponse.json({ 
      hashedPassword,
      isMatch,
      password,
      hash
    })
  } catch (error) {
    console.error('Password test error:', error)
    return NextResponse.json(
      { error: 'Password test failed' },
      { status: 500 }
    )
  }
}