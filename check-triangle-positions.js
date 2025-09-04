const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTrianglePositions() {
  try {
    // Get all Queen triangles with all positions
    const queenTriangles = await prisma.triangle.findMany({
      where: { 
        planType: 'Queen'
      },
      include: {
        positions: {
          include: {
            user: true
          },
          orderBy: [
            { level: 'asc' },
            { position: 'asc' }
          ]
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log('Queen triangles with all positions:')
    queenTriangles.forEach((triangle, index) => {
      console.log(`\nTriangle ${index + 1} (${triangle.id}):`)
      console.log(`  Plan: ${triangle.planType}`)
      console.log(`  Complete: ${triangle.isComplete}`)
      console.log(`  Total positions: ${triangle.positions.length}`)
      
      const filledPositions = triangle.positions.filter(p => p.userId).length
      console.log(`  Filled positions: ${filledPositions}`)
      console.log(`  Available positions: ${triangle.positions.length - filledPositions}`)
      
      // Show positions with users
      triangle.positions.forEach(position => {
        if (position.userId) {
          console.log(`    Position ${position.positionKey} (${position.level}-${position.position}): ${position.user?.username || position.userId}`)
        }
      })
    })
    
  } catch (error) {
    console.error('Error checking triangle positions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTrianglePositions()