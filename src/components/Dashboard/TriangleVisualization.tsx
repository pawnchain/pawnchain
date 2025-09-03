'use client'

import React from 'react'
import { User } from 'lucide-react'

interface TriangleUser {
  id: string
  username: string
  plan: string
}

interface TriangleVisualizationProps {
  data: {
    positions: (TriangleUser | null)[]
    currentUserPosition: number
    completion: number
  }
}

const TriangleVisualization: React.FC<TriangleVisualizationProps> = ({ data }) => {
  const { positions, currentUserPosition } = data

  // Triangle structure: 1 + 2 + 4 + 8 = 15 positions
  const levels = [
    { start: 0, count: 1 }, // Level 1: Position A
    { start: 1, count: 2 }, // Level 2: AB1, AB2
    { start: 3, count: 4 }, // Level 3: B1C1, B1C2, B2C1, B2C2
    { start: 7, count: 8 }, // Level 4: 8 positions
  ]

  const renderPosition = (position: TriangleUser | null, index: number) => {
    const isCurrentUser = index === currentUserPosition
    const isEmpty = position === null

    return (
      <div
        key={index}
        className={`
          relative w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105
          ${isEmpty 
            ? 'border-dashed border-gray-300 bg-gray-50' 
            : isCurrentUser
            ? 'border-blue-500 bg-blue-100'
            : 'border-gray-400 bg-white shadow-sm'
          }
          flex items-center justify-center group cursor-pointer
        `}
      >
        {isEmpty ? (
          <div className="text-gray-400 text-xs">+</div>
        ) : (
          <User className={`h-6 w-6 ${isCurrentUser ? 'text-blue-600' : 'text-gray-600'}`} />
        )}
        
        {/* Tooltip */}
        {!isEmpty && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {isCurrentUser ? 'You' : position?.username}
          </div>
        )}
        
        {/* Position number */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center">
          {index + 1}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center space-y-6">
        {levels.map((level, levelIndex) => (
          <div 
            key={levelIndex} 
            className="flex justify-center space-x-3"
          >
            {Array.from({ length: level.count }).map((_, posIndex) => {
              const actualIndex = level.start + posIndex
              return renderPosition(positions[actualIndex], actualIndex)
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 bg-blue-100 rounded"></div>
          <span className="text-sm text-gray-600">You</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-400 bg-white rounded"></div>
          <span className="text-sm text-gray-600">Filled</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-dashed border-gray-300 bg-gray-50 rounded"></div>
          <span className="text-sm text-gray-600">Empty</span>
        </div>
      </div>
    </div>
  )
}

export default TriangleVisualization