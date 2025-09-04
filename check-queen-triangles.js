const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkQueenTriangles() {
  try {
    // Find all Queen triangles
    const queenTriangles = await prisma.triangle.findMany({
      where: { 
        planType: 'Queen'
      },
      include: {
        positions: {
          where: {
            userId: null
          },
          orderBy: [
            { level: 'asc' },
            { position: 'asc' }
          ]
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log('Queen triangles:')
    console.log(JSON.stringify(queenTriangles, null, 2))
    
    // Check if there are any available positions
    const totalAvailablePositions = queenTriangles.reduce((sum, triangle) => sum + triangle.positions.length, 0)
    console.log(`\nTotal available positions in Queen triangles: ${totalAvailablePositions}`)
    
  } catch (error) {
    console.error('Error checking Queen triangles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkQueenTriangles()