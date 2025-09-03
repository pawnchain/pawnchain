'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock, Wallet, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { PlanType } from '@/types'

interface RegisterFormProps {
  onNavigate: (page: string) => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    walletAddress: '',
    plan: 'King' as PlanType,
    referralCode: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [referrerInfo, setReferrerInfo] = useState<{username: string; planType: string} | null>(null)
  const [isReferralCodeLocked, setIsReferralCodeLocked] = useState(false)

  const { register } = useAuth()
  const { addNotification } = useNotifications()

  // Handle referral code lookup
  const handleReferralCodeChange = async (code: string) => {
    setFormData({ ...formData, referralCode: code })
    
    if (code.trim() === '') {
      setReferrerInfo(null)
      setIsReferralCodeLocked(false)
      return
    }

    if (code.trim().length >= 3) { // Start lookup after 3 characters
      try {
        const response = await fetch(`/api/auth/referrer?code=${encodeURIComponent(code.trim())}`)
        
        if (response.ok) {
          const data = await response.json()
          setReferrerInfo(data.referrer)
          setIsReferralCodeLocked(true)
          
          // Automatically set the plan to match the referrer's plan
          const referrerPlan = data.referrer.planType.charAt(0).toUpperCase() + data.referrer.planType.slice(1).toLowerCase()
          setFormData(prev => ({ ...prev, plan: referrerPlan as PlanType, referralCode: code }))
          
          addNotification({
            userId: 'system',
            title: 'Referrer Found',
            message: `You will join ${data.referrer.username}'s ${referrerPlan} plan triangle`,
            type: 'info',
            read: false,
          })
        } else {
          setReferrerInfo(null)
          setIsReferralCodeLocked(false)
        }
      } catch (error) {
        console.error('Error looking up referrer:', error)
        setReferrerInfo(null)
        setIsReferralCodeLocked(false)
      }
    } else {
      setReferrerInfo(null)
      setIsReferralCodeLocked(false)
    }
  }

  const plans = [
    { name: 'King' as PlanType, price: 1.0, icon: '♔', color: 'text-yellow-600' },
    { name: 'Queen' as PlanType, price: 0.5, icon: '♕', color: 'text-purple-600' },
    { name: 'Bishop' as PlanType, price: 0.25, icon: '♗', color: 'text-green-600' },
    { name: 'Knight' as PlanType, price: 0.1, icon: '♘', color: 'text-blue-600' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      addNotification({
        userId: 'system',
        title: 'Registration Failed',
        message: 'Passwords do not match',
        type: 'error',
        read: false,
      })
      setIsLoading(false)
      return
    }

    const isEth = formData.walletAddress.startsWith('0x') && formData.walletAddress.length === 42
    // Basic Tron address check: starts with 'T' and Base58-like length ~34
    const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/
    const isTron = tronRegex.test(formData.walletAddress)

    if (!(isEth || isTron)) {
      addNotification({
        userId: 'system',
        title: 'Registration Failed',
        message: 'Please enter a valid wallet address (ETH 0x... or Tron T...)',
        type: 'error',
        read: false,
      })
      setIsLoading(false)
      return
    }

    try {
      const { success, deposit } = await register(
        formData.username,
        formData.password,
        formData.walletAddress,
        formData.plan,
        formData.referralCode
      )

      if (success) {
        addNotification({
          userId: 'system',
          title: 'Registration Successful',
          message: 'Welcome to ForgeChain Networks!',
          type: 'success',
          read: false,
        })
        if (deposit) {
          // Show deposit modal via a global notification or navigate to dashboard and open modal
          addNotification({
            userId: 'system',
            title: 'Complete Your Deposit',
            message: `Send ${deposit.amount} ${deposit.coin} on ${deposit.network} to ${deposit.walletAddress}. Expires soon.`,
            type: 'info',
            read: false,
          })
        }
        onNavigate('dashboard')
      } else {
        addNotification({
          userId: 'system',
          title: 'Registration Failed',
          message: 'Username or wallet address already exists',
          type: 'error',
          read: false,
        })
      }
    } catch (error) {
      addNotification({
        userId: 'system',
        title: 'Registration Error',
        message: 'An error occurred during registration',
        type: 'error',
        read: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join ForgeChain</h1>
            <p className="text-gray-600">Create your account and start earning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0x..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Plan {referrerInfo && <span className="text-blue-600 text-sm">(Auto-selected from referrer: {referrerInfo.username})</span>}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => !isReferralCodeLocked && setFormData({ ...formData, plan: plan.name })}
                    disabled={isReferralCodeLocked}
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      formData.plan === plan.name
                        ? 'border-blue-500 bg-blue-50'
                        : isReferralCodeLocked
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-2xl mb-1 ${plan.color} ${isReferralCodeLocked && formData.plan !== plan.name ? 'opacity-50' : ''}`}>{plan.icon}</div>
                      <div className={`font-medium text-gray-900 ${isReferralCodeLocked && formData.plan !== plan.name ? 'opacity-50' : ''}`}>{plan.name}</div>
                      <div className={`text-sm text-gray-600 ${isReferralCodeLocked && formData.plan !== plan.name ? 'opacity-50' : ''}`}>{plan.price} ETH</div>
                    </div>
                  </button>
                ))}
              </div>
              {isReferralCodeLocked && (
                <p className="text-sm text-blue-600 mt-2">
                  Plan automatically selected to match your referrer's plan type
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => handleReferralCodeChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter referral code"
                />
                {referrerInfo && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ✓ {referrerInfo.username}
                    </div>
                  </div>
                )}
              </div>
              {referrerInfo && (
                <p className="text-sm text-green-600 mt-1">
                  Valid referrer found: {referrerInfo.username} ({referrerInfo.planType} plan)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm