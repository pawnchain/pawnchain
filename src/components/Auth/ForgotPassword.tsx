'use client'

import React, { useState } from 'react'

interface ForgotPasswordProps {
  onNavigate: (page: string) => void
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [walletAddress, setWalletAddress] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'verify' | 'reset'>('verify')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [foundUsername, setFoundUsername] = useState('')

  const handleVerifyWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress.trim()) {
      setError('Please enter your wallet address')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: walletAddress.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setFoundUsername(data.username)
        setMessage(`Account found! Username: ${data.username}`)
        setStep('reset')
      } else {
        setError(data.message || 'User not found with this wallet address')
      }
    } catch (error) {
      setError('Failed to verify wallet address')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          walletAddress: walletAddress.trim(),
          newPassword 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Password updated successfully! You can now login with your new password.')
        setTimeout(() => {
          onNavigate('login')
        }, 2000)
      } else {
        setError(data.message || 'Failed to update password')
      }
    } catch (error) {
      setError('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          {step === 'verify' ? 'Password Recovery' : 'Reset Password'}
        </h2>
        
        {step === 'verify' ? (
          <>
            <p className="text-gray-600 mb-6 text-center">
              Enter your wallet address to retrieve your account.
            </p>
            <form onSubmit={handleVerifyWallet} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter wallet address (0x...)"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
              
              {message && (
                <div className="text-green-600 text-sm text-center">{message}</div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Wallet Address'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Account found!</strong><br />
                Username: <strong>{foundUsername}</strong><br />
                Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
              
              {message && (
                <div className="text-green-600 text-sm text-center">{message}</div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="w-full text-gray-600 hover:text-gray-700 py-2"
                disabled={loading}
              >
                Back to Verification
              </button>
            </form>
          </>
        )}
        
        <button
          onClick={() => onNavigate('login')}
          className="w-full text-gray-600 hover:text-gray-700 mt-4"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword