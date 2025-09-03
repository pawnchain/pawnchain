'use client'

import React, { useState } from 'react'

interface PayoutRequestModalProps {
  onClose: () => void
  onSubmit?: (amount: number, walletAddress: string) => void
  onDepositConfirm?: () => void
  deposit?: {
    transactionId: string
    amount: number
    coin: string
    network: string
    walletAddress: string
    positionId: string
    positionKey: string
    txHash?: string
  }
}

const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({ onClose, onSubmit, onDepositConfirm, deposit }) => {
  const [amount, setAmount] = useState(0)
  const [walletAddress, setWalletAddress] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (deposit) {
      if (onDepositConfirm) onDepositConfirm()
      onClose()
      return
    }
    if (onSubmit) onSubmit(amount, walletAddress)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{deposit ? 'Complete Deposit' : 'Request Payout'}</h2>
        {deposit && (
          <div className="mb-6 space-y-2">
            <div className="text-sm text-gray-600">Send exactly <span className="font-semibold text-gray-900">{deposit.amount}</span> {deposit.coin} on <span className="font-semibold text-gray-900">{deposit.network}</span> to the address below.</div>
            <div className="p-3 rounded bg-gray-100 font-mono break-all">{deposit.walletAddress}</div>
            <div className="text-xs text-gray-600 mb-2">
              <span className="font-medium">Transaction ID (For Support):</span>
              <span className="font-mono ml-1">{deposit.txHash || `DP${deposit.transactionId.slice(-5)}`}</span>
            </div>
            <div className="text-xs text-blue-600 mb-2">
              • Your position is temporarily reserved 
            </div>
            <div className="text-xs text-red-600">
              Note: If admin receives a lesser amount than required, your transaction will be rejected, your account flagged and deleted, and the funds will be lost If you have any questions concerning your transaction, please contact us with your transaction ID.
            </div>
            <div className="text-xs text-gray-700">
              Important: Send from the same wallet address you used during signup to avoid rejection.
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {deposit ? (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input value={deposit.amount} readOnly className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Coin / Network</label>
                <input value={`${deposit.coin} / ${deposit.network}`} readOnly className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 sm:text-sm" />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                <input 
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">Wallet Address</label>
                <input 
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </>
          )}
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={onClose} 
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              {deposit ? 'I have paid' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PayoutRequestModal