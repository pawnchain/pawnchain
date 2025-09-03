'use client'

import React, { useState, useEffect } from 'react'
import { Users, Copy, Share2, TrendingUp, Award, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface ReferralTransaction {
  id: string
  amount: number
  date: string
  status: string
  username: string
  plan: string
}

interface ReferralData {
  code: string
  totalReferrals: number
  totalCommission: number
  pendingCommission: number
  history: ReferralTransaction[]
  referredUsers: Array<{
    id: string
    username: string
    plan: string
    joinedAt: string
  }>
}

const Referrals: React.FC = () => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [copied, setCopied] = useState(false)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/referrals')
        if (!response.ok) {
          throw new Error('Failed to fetch referral data')
        }
        const data = await response.json()
        setReferralData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load referral data')
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading referral data...</p>
        </div>
      </div>
    )
  }

  if (error || !referralData) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Referrals</h2>
            <p className="text-red-700">{error || 'Failed to load referral data'}</p>
          </div>
        </div>
      </div>
    )
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralData.code)
      setCopied(true)
      addNotification({
        userId: user?.id || '',
        title: 'Copied!',
        message: 'Referral code copied to clipboard',
        type: 'success',
        read: false,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      addNotification({
        userId: user?.id || '',
        title: 'Copy Failed',
        message: 'Could not copy referral code',
        type: 'error',
        read: false,
      })
    }
  }

  const handleShare = async () => {
    const shareText = `Join ForgeChain Networks with my referral code: ${referralData.code}`
    const shareUrl = `${window.location.origin}/register?ref=${referralData.code}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ForgeChain Networks',
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(shareUrl)
        addNotification({
          userId: user?.id || '',
          title: 'Link Copied!',
          message: 'Referral link copied to clipboard',
          type: 'success',
          read: false,
        })
      } catch (error) {
        addNotification({
          userId: user?.id || '',
          title: 'Share Failed',
          message: 'Could not share referral link',
          type: 'error',
          read: false,
        })
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = [
    {
      label: 'Total Referrals',
      value: referralData.totalReferrals,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Active Referrals',
      value: referralData.totalReferrals, // All referrals are considered active
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Total Commission',
      value: `${referralData.totalCommission} USDT`,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      label: 'Pending Commission',
      value: `${referralData.pendingCommission} USDT`,
      icon: Award,
      color: 'text-yellow-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
          <p className="mt-2 text-gray-600">Share your referral code and earn 10% commission</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Referral Tools */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono text-blue-600">{referralData.code}</code>
                  <button
                    onClick={handleCopyCode}
                    className="ml-2 p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {copied ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCopyCode}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Code</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Link</span>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">How It Works</h4>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <p>Share your referral code with friends</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <p>They register using your code</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <p>Earn 10% commission on their investment</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <p>Withdraw commissions with your earnings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Referral History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referralData.history.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{referral.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referral.plan}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          +{referral.amount.toFixed(2)} USDT
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(referral.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                            {referral.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Referrals