import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/config - Get admin settings
export async function GET(request: NextRequest) {
  try {
    // Fetch all settings
    const settings = await prisma.adminSettings.findMany()
    
    // Transform to key-value pairs
    const config: any = {}
    settings.forEach(setting => {
      switch (setting.type) {
        case 'number':
          config[setting.key] = Number(setting.value)
          break
        case 'boolean':
          config[setting.key] = setting.value === 'true'
          break
        case 'json':
          try {
            config[setting.key] = JSON.parse(setting.value)
          } catch {
            config[setting.key] = setting.value
          }
          break
        default:
          config[setting.key] = setting.value
      }
    })
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH /api/admin/config - Update admin settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Update each setting
    const updates = Object.keys(body).map(key => {
      const value = body[key]
      const type = typeof value
      
      return prisma.adminSettings.upsert({
        where: { key },
        update: { 
          value: type === 'object' ? JSON.stringify(value) : String(value),
          type: type === 'object' ? 'json' : type
        },
        create: {
          key,
          value: type === 'object' ? JSON.stringify(value) : String(value),
          type: type === 'object' ? 'json' : type
        }
      })
    })
    
    await Promise.all(updates)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating admin settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}