'use client'

import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface TransactionStatus {
  id: string
  type: string
  amount: number
  status: string
  message: string
  closable: boolean
  deleteAccount: boolean
  rejectionReason?: string
}

interface TransactionModalProps {
  transactionId: string
  type: 'DEPOSIT' | 'PAYOUT'
  onClose?: () => void
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  transactionId,
  type,
  onClose
}) => {
  const [status, setStatus] = useState<TransactionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { logout } = useAuth()
  const { addNotification } = useNotifications()

  // Poll for status updates every 3 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}/status`)
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
          setLoading(false)
        } else {
          setError('Failed to check transaction status')
          setLoading(false)
        }
      } catch (err) {
        setError('Network error')
        setLoading(false)
      }
    }

    fetchStatus()
    
    // Set up polling interval
    const interval = setInterval(fetchStatus, 3000)
    
    return () => clearInterval(interval)
  }, [transactionId])

  const handleClose = async () => {
    if (!status?.closable) return

    if (status.deleteAccount) {
      try {
        const response = await fetch('/api/user/delete-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            transactionId,
            reason: `Modal closed after ${type} ${status.status}`
          })
        })

        if (response.ok) {
          addNotification({
            userId: 'system',
            title: 'Account Deleted',
            message: 'Your account has been deleted. You may register again to rejoin.',
            type: 'info',
            read: false
          })
          
          // Logout user first, then redirect to registration
          await logout()
          
          // Force redirect to registration page
          window.location.href = '/register'
        } else {
          throw new Error('Failed to delete account')
        }
      } catch (err) {
        addNotification({
          userId: 'system',
          title: 'Error',
          message: 'Failed to process account deletion',
          type: 'error',
          read: false
        })
      }
    } else {
      onClose?.()
    }
  }

  const getStatusIcon = () => {
    if (loading) return <Clock className="h-8 w-8 text-blue-500 animate-spin" />
    
    switch (status?.status) {
      case 'PENDING':
        return <Clock className="h-8 w-8 text-yellow-500 animate-pulse" />
      case 'CONFIRMED':
      case 'COMPLETED':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-8 w-8 text-red-500" />
      default:
        return <AlertTriangle className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status?.status) {
      case 'PENDING':
        return 'border-yellow-200 bg-yellow-50'
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'border-green-200 bg-green-50'
      case 'REJECTED':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full border border-red-200">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl p-6 max-w-md w-full border-2 ${getStatusColor()}`}>
        <div className="text-center">
          {getStatusIcon()}
          
          <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {type === 'DEPOSIT' ? 'Deposit Processing' : 'Payout Processing'}
          </h3>
          
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-mono text-sm font-semibold text-gray-800">{transactionId}</p>
          </div>

          {status && (
            <>
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-800 mb-1">
                  {status.amount.toFixed(2)} USDT
                </p>
                <p className="text-sm text-gray-600">
                  Status: {status.status}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {status.message}
                </p>
                
                {status.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">
                      <strong>Reason:</strong> {status.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {status.closable && (
                <button
                  onClick={handleClose}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    status.deleteAccount
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {status.deleteAccount ? 'Close & Delete Account' : 'Close'}
                </button>
              )}
              
              {!status.closable && (
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Please wait...</span>
                </div>
              )}
            </>
          )}
          
          {loading && (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <Clock className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading status...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionModal