import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Triangle position structure
const TRIANGLE_STRUCTURE = [
  // Level 1 (1 position)
  { level: 1, position: 0, key: 'A' },
  
  // Level 2 (2 positions)
  { level: 2, position: 0, key: 'AB1' },
  { level: 2, position: 1, key: 'AB2' },
  
  // Level 3 (4 positions)
  { level: 3, position: 0, key: 'B1C1' },
  { level: 3, position: 1, key: 'B1C2' },
  { level: 3, position: 2, key: 'B2C1' },
  { level: 3, position: 3, key: 'B2C2' },
  
  // Level 4 (8 positions)
  { level: 4, position: 0, key: 'C1D1' },
  { level: 4, position: 1, key: 'C1D2' },
  { level: 4, position: 2, key: 'C2D1' },
  { level: 4, position: 3, key: 'C2D2' },
  { level: 4, position: 4, key: 'C3D1' },
  { level: 4, position: 5, key: 'C3D2' },
  { level: 4, position: 6, key: 'C4D1' },
  { level: 4, position: 7, key: 'C4D2' },
]

export async function createTriangle(planType: string) {
  const triangle = await prisma.triangle.create({
    data: {
      planType: planType as any,
      isComplete: false,
      payoutProcessed: false,
    }
  })

  // Create all 15 positions for the triangle
  const positions = TRIANGLE_STRUCTURE.map(pos => ({
    triangleId: triangle.id,
    level: pos.level,
    position: pos.position,
    positionKey: pos.key,
    userId: null,
  }))

  await prisma.trianglePosition.createMany({
    data: positions
  })

  return triangle
}

export async function assignUserToTriangle(userId: string, referrerId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { upline: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  let targetTriangle = null

  // 1. If user has a referrer, try to place them in referrer's triangle
  if (referrerId || user.uplineId) {
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId || user.uplineId! },
      include: { trianglePosition: { include: { triangle: true } } }
    })

    if (referrer?.trianglePosition?.triangle && 
        referrer.trianglePosition.triangle.planType === user.plan &&
        !referrer.trianglePosition.triangle.isComplete) {
      
      // Check if there's an available position in referrer's triangle
      const availablePosition = await prisma.trianglePosition.findFirst({
        where: {
          triangleId: referrer.trianglePosition.triangleId,
          userId: null
        },
        orderBy: [
          { level: 'asc' },
          { position: 'asc' }
        ]
      })

      if (availablePosition) {
        targetTriangle = referrer.trianglePosition.triangle
      }
    }
  }

  // 2. If no referrer triangle available, find oldest available triangle
  if (!targetTriangle) {
    targetTriangle = await prisma.triangle.findFirst({
      where: {
        planType: user.plan,
        isComplete: false,
        positions: {
          some: {
            userId: null
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  // 3. If no available triangle, create a new one
  if (!targetTriangle) {
    targetTriangle = await createTriangle(user.plan)
  }

  // Find the next available position in the triangle
  const availablePosition = await prisma.trianglePosition.findFirst({
    where: {
      triangleId: targetTriangle.id,
      userId: null
    },
    orderBy: [
      { level: 'asc' },
      { position: 'asc' }
    ]
  })

  if (!availablePosition) {
    throw new Error('No available positions in triangle')
  }

  // Assign user to position
  await prisma.trianglePosition.update({
    where: { id: availablePosition.id },
    data: { userId: userId }
  })

  // Check if triangle is now complete
  const filledPositions = await prisma.trianglePosition.count({
    where: {
      triangleId: targetTriangle.id,
      userId: { not: null }
    }
  })

  if (filledPositions === 15) {
    await handleTriangleCompletion(targetTriangle.id)
  }

  return availablePosition
}

export async function handleTriangleCompletion(triangleId: string) {
  // Mark triangle as complete
  await prisma.triangle.update({
    where: { id: triangleId },
    data: { 
      isComplete: true,
      completedAt: new Date()
    }
  })

  // Get position A user (the one who will be forced to withdraw)
  const positionA = await prisma.trianglePosition.findFirst({
    where: {
      triangleId: triangleId,
      level: 1,
      position: 0
    },
    include: { user: true, triangle: true }
  })

  if (positionA?.user) {
    // Get plan details for payout amount
    const plan = await prisma.plan.findUnique({
      where: { name: positionA.triangle.planType }
    })

    if (plan) {
      // Create automatic withdrawal transaction
      await prisma.transaction.create({
        data: {
          userId: positionA.user.id,
          type: 'WITHDRAWAL',
          amount: plan.payout,
          status: 'PENDING',
          transactionId: `WD${Date.now()}`,
          description: 'Automatic withdrawal - Triangle completion'
        }
      })

      // Update user balance and total earned
      await prisma.user.update({
        where: { id: positionA.user.id },
        data: {
          balance: { increment: plan.payout },
          totalEarned: { increment: plan.payout }
        }
      })
    }

    // Start triangle cycling process
    await cycleTriangle(triangleId)
  }
}

export async function cycleTriangle(triangleId: string) {
  // Get all positions from the completed triangle
  const positions = await prisma.trianglePosition.findMany({
    where: { triangleId },
    include: { user: true, triangle: true },
    orderBy: [
      { level: 'asc' },
      { position: 'asc' }
    ]
  })

  const triangle = positions[0]?.triangle
  if (!triangle) return

  // Get AB1 and AB2 users (they will become new A positions)
  const ab1User = positions.find(p => p.level === 2 && p.position === 0)?.user
  const ab2User = positions.find(p => p.level === 2 && p.position === 1)?.user

  if (ab1User && ab2User) {
    // Create two new triangles
    const triangle1 = await createTriangle(triangle.planType)
    const triangle2 = await createTriangle(triangle.planType)

    // Assign AB1 to position A of triangle1
    await prisma.trianglePosition.updateMany({
      where: {
        triangleId: triangle1.id,
        level: 1,
        position: 0
      },
      data: { userId: ab1User.id }
    })

    // Assign AB2 to position A of triangle2
    await prisma.trianglePosition.updateMany({
      where: {
        triangleId: triangle2.id,
        level: 1,
        position: 0
      },
      data: { userId: ab2User.id }
    })

    // Distribute remaining users between the two triangles
    const remainingUsers = positions.filter(p => 
      p.user && p.level >= 3 && p.user.id !== ab1User.id && p.user.id !== ab2User.id
    )

    // Split users between triangles (alternate assignment)
    for (let i = 0; i < remainingUsers.length; i++) {
      const targetTriangleId = i % 2 === 0 ? triangle1.id : triangle2.id
      const user = remainingUsers[i].user!

      // Find next available position in target triangle
      const availablePosition = await prisma.trianglePosition.findFirst({
        where: {
          triangleId: targetTriangleId,
          userId: null
        },
        orderBy: [
          { level: 'asc' },
          { position: 'asc' }
        ]
      })

      if (availablePosition) {
        await prisma.trianglePosition.update({
          where: { id: availablePosition.id },
          data: { userId: user.id }
        })
      }
    }
  }

  // Mark original triangle as payout processed
  await prisma.triangle.update({
    where: { id: triangleId },
    data: { payoutProcessed: true }
  })
}

export async function getUserTriangleInfo(userId: string) {
  const position = await prisma.trianglePosition.findUnique({
    where: { userId },
    include: {
      triangle: {
        include: {
          positions: {
            include: { user: true },
            orderBy: [
              { level: 'asc' },
              { position: 'asc' }
            ]
          }
        }
      }
    }
  })

  if (!position) {
    return null
  }

  const filledPositions = position.triangle.positions.filter(p => p.userId).length
  const completion = (filledPositions / 15) * 100

  return {
    triangle: position.triangle,
    userPosition: position,
    completion,
    filledPositions
  }
}

export async function findReferrer(referralCode: string) {
  // Helper function to check if a string is a valid MongoDB ObjectId
  function isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id)
  }

  let referrer = null

  // Strategy 1: Exact ObjectId match
  if (isValidObjectId(referralCode)) {
    referrer = await prisma.user.findUnique({
      where: { id: referralCode },
      select: { id: true, username: true, plan: true }
    })
  }

  // Strategy 2: Username match
  if (!referrer) {
    referrer = await prisma.user.findUnique({
      where: { username: referralCode },
      select: { id: true, username: true, plan: true }
    })
  }

  // Strategy 3: Referral code match
  if (!referrer) {
    referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode },
      select: { id: true, username: true, plan: true }
    })
  }

  // Strategy 4: Partial ObjectId match (last 8 characters)
  if (!referrer && referralCode.length >= 3) {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, plan: true }
    })
    
    referrer = users.find(user => 
      user.id.toLowerCase().endsWith(referralCode.toLowerCase())
    ) || null
  }

  return referrer
}