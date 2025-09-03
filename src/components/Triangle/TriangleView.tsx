'use client'

import React, { useState, useEffect } from 'react'
import { Users, Clock, Target, Award, TrendingUp, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import TriangleVisualization from '@/components/Dashboard/TriangleVisualization'
import ProgressBar from '@/components/Dashboard/ProgressBar'

interface Position {
  id: string
  positionKey: string
  username: string | null
  planType: string | null
}

interface TriangleData {
  id: string
  planType: string
  isComplete: boolean
  positions: Position[]
}

const TriangleView: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'history'>('overview')
  const [triangleData, setTriangleData] = useState<TriangleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPosition, setUserPosition] = useState<string | null>(null)

  useEffect(() => {
    const fetchTriangleData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/position')
        if (!response.ok) {
          if (response.status === 404) {
            setError('You have not joined any triangle yet')
            return
          }
          throw new Error('Failed to fetch triangle data')
        }
        const data = await response.json()
        setTriangleData(data.triangle)
        setUserPosition(data.positionKey)
      } catch (err: any) {
        setError(err.message || 'Failed to load triangle data')
      } finally {
        setLoading(false)
      }
    }

    fetchTriangleData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading triangle data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Triangle Position</h2>
            <p className="text-yellow-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!triangleData) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>No triangle data available</p>
        </div>
      </div>
    )
  }

  const filledPositions = triangleData.positions.filter(p => p.username).length
  const totalPositions = 15
  const completion = (filledPositions / totalPositions) * 100
  
  const mockTriangleData = {
    positions: triangleData.positions.map(p => 
      p.username ? {
        id: p.id,
        username: p.username,
        plan: p.planType || 'Unknown'
      } : null
    ),
    currentUserPosition: triangleData.positions.findIndex(p => p.positionKey === userPosition),
    completion,
  }

  const getExpectedPayout = (positionKey: string) => {
    if (positionKey === 'A') return '4x Plan'
    if (positionKey === 'B' || positionKey === 'C') return '3x Plan'
    if (['B1', 'B2', 'C1', 'C2'].includes(positionKey)) return '2x Plan'
    return '4x Plan'
  }

  const triangleStats = [
    {
      label: 'Total Positions',
      value: totalPositions.toString(),
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Filled Positions',
      value: filledPositions.toString(),
      icon: Target,
      color: 'text-green-600',
    },
    {
      label: 'Your Position',
      value: userPosition || 'Unknown',
      icon: Award,
      color: 'text-purple-600',
    },
    {
      label: 'Expected Payout',
      value: userPosition ? getExpectedPayout(userPosition) : 'Unknown',
      icon: TrendingUp,
      color: 'text-yellow-600',
    },
  ]

  const positionHistory = triangleData.positions
    .filter(p => p.username)
    .map((p, index) => ({
      position: p.positionKey,
      user: p.username!,
      timestamp: 'Recently joined',
      status: 'confirmed',
    }))

  const timeLeft = {
    days: 2,
    hours: 14,
    minutes: 23,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Triangle</h1>
          <p className="mt-2 text-gray-600">Track your position and triangle progress</p>
        </div>

        {/* Triangle Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {triangleStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Triangle Complete Alert */}
        {triangleData.isComplete && userPosition === 'A' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <Award className="h-6 w-6 text-green-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  🎉 Triangle Complete! Ready for Payout
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Congratulations! Your triangle is complete with all 15 positions filled. As position A, you can now request payout which will trigger the triangle split.
                </p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'wallet' }))}
                  className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Go to Wallet to Request Payout →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Remaining Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Triangle Completion Estimated
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Estimated completion in {timeLeft.days} days, {timeLeft.hours} hours, {timeLeft.minutes} minutes based on current filling rate
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'positions', label: 'Positions', icon: Users },
                { id: 'history', label: 'History', icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Triangle Visualization</h2>
                  <ProgressBar 
                    current={filledPositions} 
                    total={totalPositions} 
                    label="Triangle Completion"
                    color="blue"
                  />
                </div>
                <TriangleVisualization data={mockTriangleData} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Your Position:</span>
                    <span className="font-medium">{userPosition || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan Type:</span>
                    <span className="font-medium">{triangleData.planType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Triangle Status:</span>
                    <span className="font-medium">{triangleData.isComplete ? 'Complete' : 'In Progress'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expected Payout:</span>
                    <span className="font-medium text-green-600">{userPosition ? getExpectedPayout(userPosition) : 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Progress:</span>
                    <span className="font-medium text-blue-600">{completion.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Invite More Users</p>
                    <p className="text-xs text-blue-700 mt-1">Share your referral code to fill remaining positions faster</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Wait for Completion</p>
                    <p className="text-xs text-gray-700 mt-1">Triangle will complete automatically when all 15 positions are filled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Positions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {triangleData.positions.map((position, i) => {
                    const isYou = position.positionKey === userPosition
                    const isFilled = position.username !== null
                    return (
                      <tr key={position.id} className={isYou ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {position.positionKey}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isFilled ? (isYou ? 'You' : position.username) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isFilled ? position.planType : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isFilled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isFilled ? 'Filled' : 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isFilled ? 'Recently joined' : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Position History</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {positionHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">#{entry.position}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.user}</p>
                        <p className="text-sm text-gray-500">Joined position #{entry.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{entry.timestamp}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TriangleView