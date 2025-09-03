'use client'

import React, { useEffect, useState } from 'react'

type AdminTx = {
  id: string
  txHash?: string
  user: string
  plan: string | null
  type: 'DEPOSIT' | 'PAYOUT' | 'REFERRAL_BONUS' | 'WITHDRAWAL'
  amount: number
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CONSOLIDATED'
  createdAt: string
}

const statuses: AdminTx['status'][] = ['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED']

const AdminTransactions: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<AdminTx[]>([])
  const [updating, setUpdating] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    try {
      const t = localStorage.getItem('tx_type_filter')
      if (t) {
        setTypeFilter(t)
        localStorage.removeItem('tx_type_filter')
      }
    } catch {}
  }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/transactions')
      if (!res.ok) throw new Error('Failed to load transactions')
      const data = await res.json()
      setRows(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (id: string, status: AdminTx['status']) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await load()
    } catch (e: any) {
      setError(e.message || 'Failed to update')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading transactions...</p>
        </div>
      </div>
    )
  }

  const filtered = rows.filter(r => (typeFilter === 'all' || r.type === typeFilter) && (statusFilter === 'all' || r.status === statusFilter))
  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-2 text-gray-600">Manage user deposits and payouts</p>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4 flex items-center space-x-3">
          <label className="text-sm">Type</label>
          <select value={typeFilter} onChange={(e) => { setPage(1); setTypeFilter(e.target.value) }} className="border rounded px-2 py-1 text-sm">
            <option value="all">All</option>
            <option value="DEPOSIT">DEPOSIT</option>
            <option value="PAYOUT">PAYOUT</option>
            <option value="REFERRAL_BONUS">REFERRAL_BONUS</option>
            <option value="WITHDRAWAL">WITHDRAWAL</option>
          </select>
          <label className="text-sm">Status</label>
          <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }} className="border rounded px-2 py-1 text-sm">
            <option value="all">All</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="text-sm">Page size</label>
          <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)) }} className="border rounded px-2 py-1 text-sm">
            {[10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paged.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {tx.txHash || `${tx.type === 'DEPOSIT' ? 'DP' : tx.type === 'PAYOUT' ? 'WD' : 'TX'}${tx.id.slice(-5)}`}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tx.txHash || tx.id)
                            // Could add a toast notification here
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          title="Copy full transaction ID"
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.plan || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <select
                        disabled={updating === tx.id}
                        value={tx.status}
                        onChange={(e) => updateStatus(tx.id, e.target.value as AdminTx['status'])}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={updating === tx.id}
                          onClick={() => updateStatus(tx.id, 'COMPLETED')}
                          className="px-3 py-1 rounded bg-green-600 text-white text-xs disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          disabled={updating === tx.id}
                          onClick={() => updateStatus(tx.id, 'REJECTED')}
                          className="px-3 py-1 rounded bg-red-600 text-white text-xs disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing {filtered.length === 0 ? 0 : start + 1}-{Math.min(start + pageSize, filtered.length)} of {filtered.length}</div>
          <div className="space-x-2">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
            <button disabled={start + pageSize >= filtered.length} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTransactions