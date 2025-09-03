'use client'

import React from 'react'

interface ProgressBarProps {
  current: number
  total: number
  label: string
  color?: 'blue' | 'green' | 'purple' | 'yellow'
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  label, 
  color = 'blue' 
}) => {
  const percentage = (current / total) * 100
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  }

  const bgColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    yellow: 'bg-yellow-100',
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-900">
          {current}/{total} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className={`w-full ${bgColorClasses[color]} rounded-full h-3`}>
        <div
          className={`h-3 ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressBar