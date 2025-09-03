'use client'

import React from 'react'

interface ReferralModalProps {
  referralCode: string
  onClose: () => void
}

const ReferralModal: React.FC<ReferralModalProps> = ({ referralCode, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Your Referral Code</h2>
        <p className="text-lg mb-4">{referralCode}</p>
        <button 
          onClick={onClose} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default ReferralModal