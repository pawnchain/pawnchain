'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const ChessAdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [config, setConfig] = useState({
    depositWallet: '',
    depositCoin: 'USDT',
    depositNetwork: 'TRON (TRC20)',
    MAINTENANCE_MODE: false,
    REGISTRATION_ENABLED: true,
    REFERRAL_BONUS_ENABLED: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/config')
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json()
      setConfig(prev => ({ ...prev, ...data }))
    } catch (err: any) {
      setError(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
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
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
        <div className="relative py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold gradient-text">Royal System Configuration</h1>
              <p className="text-gray-400 mt-2">Loading settings...</p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
      
      <div className="relative py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold gradient-text flex items-center">
              <motion.span
                className="mr-3 text-4xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                ⚙️
              </motion.span>
              Royal System Configuration
            </h1>
            <p className="text-gray-400 mt-2">Configure kingdom settings and system parameters</p>
          </motion.div>

          {error && (
            <motion.div 
              className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-red-200">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div 
              className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-green-200">{success}</p>
            </motion.div>
          )}

          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Deposit Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deposit Wallet Address</label>
                <input
                  type="text"
                  value={config.depositWallet}
                  onChange={(e) => setConfig({ ...config, depositWallet: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="T... or 0x..."
                />
                <p className="mt-2 text-sm text-gray-400">Users will send deposits to this address</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Coin</label>
                <input
                  type="text"
                  value={config.depositCoin}
                  onChange={(e) => setConfig({ ...config, depositCoin: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="USDT"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                <input
                  type="text"
                  value={config.depositNetwork}
                  onChange={(e) => setConfig({ ...config, depositNetwork: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="TRON (TRC20)"
                />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-xl font-bold text-white mb-6">System Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Maintenance Mode</label>
                    <p className="text-xs text-gray-400 mt-1">Temporarily disable user access</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, MAINTENANCE_MODE: !config.MAINTENANCE_MODE })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.MAINTENANCE_MODE ? 'bg-red-600' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.MAINTENANCE_MODE ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Registration Enabled</label>
                    <p className="text-xs text-gray-400 mt-1">Allow new user registrations</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, REGISTRATION_ENABLED: !config.REGISTRATION_ENABLED })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.REGISTRATION_ENABLED ? 'bg-green-600' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.REGISTRATION_ENABLED ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Referral Bonus</label>
                    <p className="text-xs text-gray-400 mt-1">Enable referral bonuses</p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, REFERRAL_BONUS_ENABLED: !config.REFERRAL_BONUS_ENABLED })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.REFERRAL_BONUS_ENABLED ? 'bg-green-600' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${config.REFERRAL_BONUS_ENABLED ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ChessAdminSettings