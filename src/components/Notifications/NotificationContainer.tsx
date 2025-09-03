'use client'

import React from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import ToastNotification from './ToastNotification'

const NotificationContainer: React.FC = () => {
  const { notifications, markAsRead } = useNotifications()

  const handleClose = (id: string) => {
    markAsRead(id)
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.slice(0, 5).map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={handleClose}
        />
      ))}
    </div>
  )
}

export default NotificationContainer