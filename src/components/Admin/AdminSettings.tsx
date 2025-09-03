'use client'

import React, { useEffect, useState } from 'react'

type Config = {
  id?: string
  depositWallet?: string
  depositCoin?: string
  depositNetwork?: string
  [key: string]: any // For other settings
}

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [config, setConfig] = useState<Config>({
    depositWallet: '',
    depositCoin: 'USDT',
    depositNetwork: 'TRON (TRC20)'
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/config')
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json()
      setConfig(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      setSuccess('Settings saved successfully')
    } catch (e: any) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-gray-600">Configure deposit destination for user payments</p>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Wallet Address</label>
            <input
              type="text"
              value={config.depositWallet || ''}
              onChange={(e) => setConfig({ ...config, depositWallet: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="T... or 0x..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coin</label>
              <input
                type="text"
                value={config.depositCoin || 'USDT'}
                onChange={(e) => setConfig({ ...config, depositCoin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="USDT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
              <input
                type="text"
                value={config.depositNetwork || 'TRON (TRC20)'}
                onChange={(e) => setConfig({ ...config, depositNetwork: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="TRON (TRC20)"
              />
            </div>
          </div>
          
          {/* System Settings */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">System Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
                  <p className="text-xs text-gray-500">Temporarily disable user access</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, MAINTENANCE_MODE: !(config.MAINTENANCE_MODE === true) })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${config.MAINTENANCE_MODE === true ? 'bg-red-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.MAINTENANCE_MODE === true ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Enabled</label>
                  <p className="text-xs text-gray-500">Allow new user registrations</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, REGISTRATION_ENABLED: !(config.REGISTRATION_ENABLED === true) })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${config.REGISTRATION_ENABLED === true ? 'bg-green-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.REGISTRATION_ENABLED === true ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Referral Bonus</label>
                  <p className="text-xs text-gray-500">Enable referral bonuses</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, REFERRAL_BONUS_ENABLED: !(config.REFERRAL_BONUS_ENABLED === true) })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${config.REFERRAL_BONUS_ENABLED === true ? 'bg-green-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.REFERRAL_BONUS_ENABLED === true ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings