'use client'

import React, { useEffect, useState } from 'react'
import { Wallet as WalletIcon, TrendingUp, Download, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import TransactionModal from '@/components/Modals/TransactionModal'

const Wallet: React.FC = () => {
  const { user, logout } = useAuth()
  const { addNotification } = useNotifications()
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [walletData, setWalletData] = useState({ 
    balance: 0, 
    pendingEarnings: 0, 
    totalEarned: 0, 
    referralBonus: 0,
    positionInfo: null as { positionKey: string; triangleComplete: boolean; earnedFromPosition: number; filledPositions?: number } | null
  })
  const [transactions, setTransactions] = useState<Array<{ id: string; type: string; amount: number; status: string; date: string }>>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/user/wallet')
        if (!res.ok) throw new Error('Failed to load wallet')
        const data = await res.json()
        setWalletData({ 
          balance: data.balance, 
          pendingEarnings: data.pendingEarnings, 
          totalEarned: data.totalEarned, 
          referralBonus: data.referralBonus,
          positionInfo: data.positionInfo
        })
        setTransactions(data.history)
      } catch (e: any) {
        setError(e.message || 'Failed to load wallet')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const canRequestPayout = () => {
    if (!walletData.positionInfo) return false
    
    // Only position A can request payout
    if (walletData.positionInfo.positionKey !== 'A') return false
    
    // Triangle must be complete (all 15 positions filled)
    if (!walletData.positionInfo.triangleComplete) return false
    
    // Check if all 15 positions are filled
    if (walletData.positionInfo.filledPositions !== 15) return false
    
    return true
  }

  const getPayoutButtonText = () => {
    if (!walletData.positionInfo) return 'No Triangle Position'
    
    if (walletData.positionInfo.positionKey !== 'A') {
      return `Only Position A Can Request Payout (You are in ${walletData.positionInfo.positionKey})`
    }
    
    if (!walletData.positionInfo.triangleComplete || walletData.positionInfo.filledPositions !== 15) {
      return `Triangle Not Complete (${walletData.positionInfo.filledPositions || 0}/15 positions filled)`
    }
    
    return 'Request Payout & Split Triangle'
  }

  const handlePayoutRequest = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      addNotification({ userId: user?.id || '', title: 'Invalid Amount', message: 'Please enter a valid payout amount', type: 'error', read: false })
      return
    }

    if (parseFloat(payoutAmount) > walletData.balance) {
      addNotification({ userId: user?.id || '', title: 'Insufficient Balance', message: 'Payout amount exceeds available balance', type: 'error', read: false })
      return
    }

    try {
      const res = await fetch('/api/payout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: parseFloat(payoutAmount), walletAddress: user?.walletAddress }) })
      const responseData = await res.json()
      
      if (!res.ok) {
        addNotification({ userId: user?.id || '', title: 'Payout Failed', message: responseData.message || 'Failed to request payout', type: 'error', read: false })
      } else {
        // Show transaction modal instead of success notification
        setCurrentTransactionId(responseData.transactionId)
        setShowTransactionModal(true)
        setShowPayoutModal(false)
        setPayoutAmount('')
        
        addNotification({ 
          userId: user?.id || '', 
          title: 'Payout Submitted', 
          message: 'Your payout request is being processed by admin.', 
          type: 'info', 
          read: false 
        })
      }
    } catch {
      addNotification({ userId: user?.id || '', title: 'Payout Failed', message: 'Failed to request payout', type: 'error', read: false })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '↓'
      case 'PAYOUT':
        return '↑'
      case 'REFERRAL_BONUS':
        return '→'
      default:
        return '•'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><p>Loading wallet...</p></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="mt-2 text-gray-600">Manage your funds and track transactions</p>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">{walletData.balance.toFixed(2)} USDT</p>
                <p className="text-xs text-gray-500 mt-1">Referral Bonus + Plan Earnings</p>
              </div>
              <WalletIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Earnings</p>
                <p className="text-2xl font-bold text-yellow-600">{walletData.pendingEarnings.toFixed(2)} USDT</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Plan Earnings</p>
                <p className="text-2xl font-bold text-green-600">{walletData.totalEarned.toFixed(2)} USDT</p>
                <p className="text-xs text-gray-500 mt-1">
                  {walletData.positionInfo ? 
                    `Position ${walletData.positionInfo.positionKey}: ${walletData.positionInfo.earnedFromPosition.toFixed(2)} USDT` : 
                    'Based on position level'
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Referral Bonus</p>
                <p className="text-2xl font-bold text-purple-600">{walletData.referralBonus.toFixed(2)} USDT</p>
                <p className="text-xs text-gray-500 mt-1">10% commission</p>
              </div>
              <Download className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.type}</p>
                          <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === 'PAYOUT' ? 'text-green-600' : transaction.type === 'DEPOSIT' ? 'text-red-600' : 'text-purple-600'}`}>
                          {transaction.type === 'PAYOUT' ? '+' : transaction.type === 'DEPOSIT' ? '-' : '+'}
                          {transaction.amount.toFixed(2)} USDT
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {canRequestPayout() ? (
                  <>
                    <button
                      onClick={() => setShowPayoutModal(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Request Payout & Split Triangle
                    </button>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Available: {walletData.balance.toFixed(2)} USDT</p>
                      <p className="text-xs text-green-600 mt-1">✓ All conditions met for payout</p>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed"
                    >
                      {getPayoutButtonText()}
                    </button>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Available: {walletData.balance.toFixed(2)} USDT</p>
                      {walletData.positionInfo && (
                        <p className="text-xs text-yellow-600 mt-1">
                          {walletData.positionInfo.positionKey !== 'A' 
                            ? 'Only position A can request payout'
                            : `Wait for triangle completion (${walletData.positionInfo.filledPositions || 0}/15)`
                          }
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    All payout requests require manual admin approval. Transaction fees and gas fees are your responsibility.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
              <div className="space-y-3">
                {walletData.positionInfo ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Position:</span>
                      <span className="font-medium">{walletData.positionInfo.positionKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Triangle Status:</span>
                      <span className={`font-medium ${walletData.positionInfo.triangleComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                        {walletData.positionInfo.triangleComplete ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plan Earnings:</span>
                      <span className="font-medium text-green-600">
                        {walletData.positionInfo.earnedFromPosition.toFixed(2)} USDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Referral Bonus:</span>
                      <span className="font-medium text-purple-600">
                        {walletData.referralBonus.toFixed(2)} USDT
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total Available:</span>
                      <span className="text-green-600">
                        {walletData.balance.toFixed(2)} USDT
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">No position found. Join a triangle to start earning.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Your Address:</span>
                  <span className="font-mono text-sm text-gray-900">
                    {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan Type:</span>
                  <span className="text-gray-900">{user?.plan}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Modal */}
        {showPayoutModal && canRequestPayout() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Payout & Split Triangle</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
                <input type="number" step="0.01" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter amount" max={walletData.balance} />
                <p className="text-sm text-gray-500 mt-1">Available: {walletData.balance.toFixed(2)} USDT</p>
                <p className="text-sm text-green-600 mt-1">Maximum payout: {walletData.balance.toFixed(2)} USDT (available balance)</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Triangle Splitting Process:</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Your triangle is complete (15/15 positions filled)</p>
                  <p>• AB1 and AB2 users will become new position A</p>
                  <p>• Other users will be promoted accordingly</p>
                  <p>• Last 8 positions will become empty in new triangles</p>
                  <p>• Referral bonuses will be distributed</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800"><strong>Warning:</strong> Gas fees and transaction fees will be deducted from your payout amount. Admin approval is required for all payouts.</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setShowPayoutModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Cancel</button>
                <button onClick={handlePayoutRequest} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Submit Request</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Transaction Modal for Payout Processing */}
        {showTransactionModal && currentTransactionId && (
          <TransactionModal
            transactionId={currentTransactionId}
            type="PAYOUT"
            onClose={() => {
              setShowTransactionModal(false)
              setCurrentTransactionId(null)
              // Reload wallet data to reflect changes
              window.location.reload()
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Wallet