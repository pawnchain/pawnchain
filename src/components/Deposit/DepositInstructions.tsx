'use client'

import React, { useState } from 'react'
import { Clock, Copy, CheckCircle } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import TransactionModal from '@/components/Modals/TransactionModal'

interface DepositInfo {
  positionId: string
  positionKey: string
  amount: number
  coin: string
  walletAddress: string
  network: string
  transactionId: string
  txHash?: string
}

interface DepositInstructionsProps {
  depositInfo: DepositInfo
  onModalClose?: () => void
  onAccountDelete?: () => void
}

const DepositInstructions: React.FC<DepositInstructionsProps> = ({
  depositInfo,
  onModalClose,
  onAccountDelete
}) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const { addNotification } = useNotifications()

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemName)
      setTimeout(() => setCopiedItem(null), 2000)
      addNotification({
        userId: 'system',
        title: 'Copied',
        message: `${itemName} copied to clipboard`,
        type: 'success',
        read: false
      })
    } catch (err) {
      addNotification({
        userId: 'system',
        title: 'Error',
        message: 'Failed to copy to clipboard',
        type: 'error',
        read: false
      })
    }
  }

  const handleDepositConfirmation = async () => {
    setIsConfirming(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: depositInfo.transactionId })
      })

      if (response.ok) {
        setShowModal(true)
        addNotification({
          userId: 'system',
          title: 'Deposit Submitted',
          message: 'Admin is processing your deposit. Please wait.',
          type: 'info',
          read: false
        })
      } else {
        throw new Error('Failed to submit deposit confirmation')
      }
    } catch (error) {
      addNotification({
        userId: 'system',
        title: 'Error',
        message: 'Failed to submit deposit confirmation. Please try again.',
        type: 'error',
        read: false
      })
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Deposit
              </h1>
              <p className="text-gray-600">
                Send the exact amount to secure your position in the triangle
              </p>
            </div>

            {/* Position Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Your Triangle Position
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-bold text-lg text-blue-600">
                    {depositInfo.positionKey}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Position ID</p>
                  <p className="font-mono text-sm text-gray-800">
                    {depositInfo.positionId.slice(-8)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Instructions
              </h3>
              
              <div className="grid gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {depositInfo.amount} {depositInfo.coin}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(depositInfo.amount.toString(), 'Amount')}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Wallet Address</p>
                      <p className="font-mono text-sm text-gray-800 break-all">
                        {depositInfo.walletAddress}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(depositInfo.walletAddress, 'Wallet Address')}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors ml-2"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Network</p>
                      <p className="font-semibold text-gray-800">
                        {depositInfo.network}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID (For Support)</p>
                      <p className="font-mono text-sm text-gray-800">
                        {depositInfo.txHash || `DP${depositInfo.transactionId.slice(-5)}`}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(depositInfo.txHash || depositInfo.transactionId, 'Transaction ID')}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Important Notes:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Send the EXACT amount specified above</li>
                  <li>• Use the {depositInfo.network} network only</li>
                  <li>• Your position is permanently reserved (no time limit)</li>
                  <li>• Keep your transaction ID for support purposes</li>
                  <li>• Only click "I have deposited" after making the payment</li>
                </ul>
              </div>

              {/* Confirmation Button */}
              <div className="space-y-4">
                <button
                  onClick={handleDepositConfirmation}
                  disabled={isConfirming}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                >
                  {isConfirming ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'I have deposited'
                  )}
                </button>
                
                <p className="text-center text-sm text-gray-600">
                  Only click this button after you have sent the payment.
                  <br />
                  You will see a confirmation popup that cannot be closed until admin processes your deposit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          transactionId={depositInfo.transactionId}
          type="DEPOSIT"
          onClose={() => {
            setShowModal(false)
            onModalClose?.()
          }}
        />
      )}
    </>
  )
}

export default DepositInstructions