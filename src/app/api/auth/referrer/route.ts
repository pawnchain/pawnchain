import { NextRequest, NextResponse } from 'next/server'
import { findReferrer } from '@/lib/triangle'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    const referrer = await findReferrer(code)

    if (!referrer) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      referrer: {
        id: referrer.id,
        username: referrer.username,
        planType: referrer.plan
      }
    })

  } catch (error) {
    console.error('Referrer lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup referrer' },
      { status: 500 }
    )
  }
}