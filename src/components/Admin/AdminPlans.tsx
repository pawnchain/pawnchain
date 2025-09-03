'use client'

import React, { useEffect, useState } from 'react'

type Plan = {
  id: string
  type: 'KING' | 'QUEEN' | 'BISHOP' | 'KNIGHT'
  price: number
  active: boolean
}

const AdminPlans: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/plans')
      if (!res.ok) throw new Error('Failed to load plans')
      const data = await res.json()
      setPlans(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const savePlan = async (type: Plan['type'], updates: Partial<Pick<Plan, 'price' | 'active'>>) => {
    setSaving(type)
    try {
      const res = await fetch(`/api/admin/plans/${type}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update plan')
      await load()
    } catch (e: any) {
      setError(e.message || 'Failed to update')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Plan Management</h1>
          <p className="mt-2 text-gray-600">Configure prices and availability</p>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        defaultValue={p.price}
                        onBlur={(e) => {
                          const value = Number(e.currentTarget.value)
                          if (value !== p.price) savePlan(p.type, { price: value })
                        }}
                        className="border border-gray-300 rounded px-2 py-1 w-28"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="checkbox"
                        defaultChecked={p.active}
                        onChange={(e) => savePlan(p.type, { active: e.currentTarget.checked })}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        disabled={saving === p.type}
                        onClick={() => savePlan(p.type, { price: p.price, active: p.active })}
                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs disabled:opacity-50"
                      >
                        {saving === p.type ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPlans