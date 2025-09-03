'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { useNotifications } from './NotificationContext'
import { Notification } from '@/types'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Only connect to socket if user is authenticated
    if (user) {
      // Connect to the Socket.IO server
      const socketInstance = io('', {
        path: '/api/socketio',
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected')
        setConnected(true)
      })

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })

      // Listen for notifications
      socketInstance.on('notification', (notification: Omit<Notification, 'id' | 'createdAt'>) => {
        addNotification(notification)
      })

      // Listen for triangle position updates
      socketInstance.on('triangle_update', (data) => {
        addNotification({
          userId: user.id,
          title: 'Triangle Update',
          message: `Position ${data.position} has been ${data.status}`,
          type: 'info',
          read: false,
        })
      })

      // Listen for transaction status changes
      socketInstance.on('transaction_update', (data) => {
        const notificationType = data.status === 'confirmed' ? 'success' : 
                               data.status === 'rejected' ? 'error' : 'info'
        
        addNotification({
          userId: user.id,
          title: 'Transaction Update',
          message: `Your ${data.type} transaction of ${data.amount} has been ${data.status}`,
          type: notificationType,
          read: false,
        })
      })

      setSocket(socketInstance)

      // Clean up on unmount
      return () => {
        socketInstance.disconnect()
      }
    }
  }, [user, addNotification])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}