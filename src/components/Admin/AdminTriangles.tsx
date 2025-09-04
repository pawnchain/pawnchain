'use client'

import React, { useState, useEffect } from 'react'
import { Triangle, Eye, Crown, Shield, Sword, Castle } from 'lucide-react'

interface TriangleData {
  id: string
  planType: string
  isComplete: boolean
  completion: string
  filledPositions: number
  totalPositions: number
  createdAt: string
  completedAt: string | null
  payoutProcessed: boolean
  positions: Array<{
    id: string
    positionKey: string
    level: number
    position: number
    user: {
      username: string
      plan: string
    } | null
  }>
}

interface TriangleStats {
  planType: string
  active: number
  completed: number
  total: number
}

const AdminTriangles: React.FC = () => {
  const [triangles, setTriangles] = useState<TriangleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTriangle, setSelectedTriangle] = useState<TriangleData | null>(null)
  const [showTriangleModal, setShowTriangleModal] = useState(false)
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [triangleStats, setTriangleStats] = useState<TriangleStats[]>([])

  useEffect(() => {
    const fetchTriangles = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/admin/triangles')
        if (response.ok) {
          const data = await response.json()
          setTriangles(data)
          
          // Calculate stats by plan
          const stats = calculateTriangleStats(data)
          setTriangleStats(stats)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch triangles')
          setTriangles([])
        }
      } catch (error: any) {
        console.error('Failed to fetch triangles:', error)
        setError('Network error while fetching triangles')
        setTriangles([])
      } finally {
        setLoading(false)
      }
    }

    fetchTriangles()
  }, [])

  const calculateTriangleStats = (triangles: TriangleData[]): TriangleStats[] => {
    const planTypes = ['King', 'Queen', 'Bishop', 'Knight']
    return planTypes.map(planType => {
      const planTriangles = triangles.filter(t => t.planType === planType)
      const active = planTriangles.filter(t => !t.isComplete).length
      const completed = planTriangles.filter(t => t.isComplete).length
      return {
        planType,
        active,
        completed,
        total: active + completed
      }
    })
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'King': return <Crown className="h-5 w-5 text-yellow-500" />
      case 'Queen': return <Castle className="h-5 w-5 text-purple-500" />
      case 'Bishop': return <Shield className="h-5 w-5 text-blue-500" />
      case 'Knight': return <Sword className="h-5 w-5 text-gray-500" />
      default: return <Crown className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (isComplete: boolean, payoutProcessed: boolean) => {
    if (payoutProcessed) return 'bg-gray-100 text-gray-800'
    if (isComplete) return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusLabel = (isComplete: boolean, payoutProcessed: boolean) => {
    if (payoutProcessed) return 'Cycled'
    if (isComplete) return 'Complete'
    return 'Active'
  }

  const filteredTriangles = triangles.filter(triangle => {
    const matchesPlan = filterPlan === 'all' || triangle.planType === filterPlan
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && !triangle.isComplete) ||
      (filterStatus === 'complete' && triangle.isComplete && !triangle.payoutProcessed) ||
      (filterStatus === 'cycled' && triangle.payoutProcessed)
    
    return matchesPlan && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading triangles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Triangle Formations</h1>
              <p className="mt-2 text-gray-600">Manage and monitor all triangle formations</p>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{triangles.length}</p>
              <p className="text-sm text-gray-600">Total Formations</p>
            </div>
          </div>
        </div>

        {/* Triangle Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {triangleStats.map((stat) => (
            <div key={stat.planType} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getPlanIcon(stat.planType)}
                  <h3 className="text-lg font-semibold text-gray-900">{stat.planType}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stat.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stat.active}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stat.completed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Plans</option>
              <option value="King">King</option>
              <option value="Queen">Queen</option>
              <option value="Bishop">Bishop</option>
              <option value="Knight">Knight</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Formations</option>
              <option value="complete">Complete Formations</option>
              <option value="cycled">Cycled Formations</option>
            </select>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredTriangles.length} of {triangles.length} formations
          </div>
        </div>

        {/* Triangles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTriangles.map((triangle) => (
            <div 
              key={triangle.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedTriangle(triangle)
                setShowTriangleModal(true)
              }}
            >
              {/* Triangle Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getPlanIcon(triangle.planType)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{triangle.planType}</h3>
                    <p className="text-sm text-gray-500">#{triangle.id.slice(-6)}</p>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(triangle.isComplete, triangle.payoutProcessed)}`}>
                  {getStatusLabel(triangle.isComplete, triangle.payoutProcessed)}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900">{triangle.filledPositions}/15</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${triangle.completion}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(triangle.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Members</p>
                  <p className="font-medium text-gray-900">{triangle.filledPositions}</p>
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTriangle(triangle)
                  setShowTriangleModal(true)
                }}
                className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          ))}
        </div>

        {filteredTriangles.length === 0 && (
          <div className="text-center py-12">
            <Triangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No formations found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Triangle Details Modal */}
      {/* Note: Modal implementation would go here, similar to the Chess version */}
    </div>
  )
}

export default AdminTriangles