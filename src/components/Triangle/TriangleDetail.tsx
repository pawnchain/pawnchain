'use client'

import React, { useState, useEffect } from 'react'

const TriangleDetail: React.FC = () => {
  const [triangleData, setTriangleData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTriangleData = async () => {
      try {
        const response = await fetch('/api/triangle')
        if (response.ok) {
          const data = await response.json()
          setTriangleData(data)
        } else {
          setError('Failed to fetch triangle data')
        }
      } catch (err) {
        setError('An error occurred while fetching triangle data')
      } finally {
        setLoading(false)
      }
    }

    fetchTriangleData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Triangle Details</h1>
        {loading && <p>Loading triangle data...</p>}
        {error && <p>{error}</p>}
        {triangleData && (
          <div>
            {/* Add triangle details here */}
            <pre>{JSON.stringify(triangleData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default TriangleDetail