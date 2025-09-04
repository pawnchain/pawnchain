const { PrismaClient } = require('@prisma/client')

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

async function createTriangle(planType) {
  const triangle = await prisma.triangle.create({
    data: {
      planType: planType,
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

async function createTestTriangle() {
  try {
    console.log('Creating a new Queen triangle...')
    
    // Create a new triangle
    const triangle = await createTriangle('Queen')
    
    console.log('Created triangle:', triangle)
    
    // Check positions created
    const positions = await prisma.trianglePosition.findMany({
      where: { triangleId: triangle.id },
      orderBy: [
        { level: 'asc' },
        { position: 'asc' }
      ]
    })
    
    console.log(`Created ${positions.length} positions:`)
    positions.forEach(pos => {
      console.log(`  ${pos.positionKey} (${pos.level}-${pos.position})`)
    })
    
  } catch (error) {
    console.error('Error creating test triangle:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestTriangle()