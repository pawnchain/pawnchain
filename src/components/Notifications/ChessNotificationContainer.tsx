'use client'

import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/contexts/NotificationContext'
import ChessToastNotification from './ChessToastNotification'

const ChessNotificationContainer: React.FC = () => {
  const { notifications, markAsRead } = useNotifications()

  const handleClose = (id: string) => {
    markAsRead(id)
  }

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, 5).map((notification) => (
          <ChessToastNotification
            key={notification.id}
            notification={notification}
            onClose={handleClose}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ChessNotificationContainer