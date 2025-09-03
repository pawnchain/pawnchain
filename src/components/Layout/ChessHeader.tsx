'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Shield, Sword, Castle, Bell, LogOut, Menu, X, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface ChessHeaderProps {
  onNavigate: (page: string) => void
  currentPage: string
}

const ChessHeader: React.FC<ChessHeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, isAdmin, logout } = useAuth()
  const { notifications } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const unreadCount = (notifications || []).filter(n => !n.read).length

  const handleLogout = () => {
    logout()
    onNavigate('login')
  }

  const navItems = isAdmin ? [
    { id: 'admin-dashboard', label: 'Command Center', icon: Crown },
    { id: 'admin-users', label: 'Knights', icon: Shield },
    { id: 'admin-transactions', label: 'Treasury', icon: Sword },
    { id: 'admin-triangles', label: 'Formations', icon: Castle },
    { id: 'admin-plans', label: 'Kingdoms', icon: Castle },
    { id: 'admin-settings', label: 'Royal Decree', icon: Crown },
  ] : [
    { id: 'dashboard', label: 'Kingdom', icon: Crown },
    { id: 'triangle', label: 'Battle Formation', icon: Shield },
    { id: 'wallet', label: 'Treasury', icon: Sword },
    { id: 'referrals', label: 'Recruit Knights', icon: Castle },
  ]

  return (
    <motion.header 
      className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 shadow-2xl border-b border-gold-500/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="chess-board-pattern absolute inset-0 opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <motion.div
                className="text-4xl chess-piece-shadow"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                ♔
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-20 blur-lg"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">ForgeChain</h1>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Networks</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {currentPage === item.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 text-gray-300 hover:text-yellow-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    className="absolute right-0 mt-2 w-80 glass-morphism rounded-xl shadow-2xl border border-white/20 z-50"
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="p-4 border-b border-white/10">
                      <h3 className="font-semibold text-white">Royal Announcements</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-gray-400 text-center">No announcements</p>
                      ) : (
                        notifications.slice(0, 5).map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            className={`p-4 border-b border-white/10 ${!notification.read ? 'bg-blue-500/10' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <h4 className="font-medium text-white">{notification.title}</h4>
                            <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.createdAt.toLocaleTimeString()}
                            </p>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <motion.div 
              className="flex items-center space-x-3 glass-morphism rounded-lg px-4 py-2"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  {isAdmin ? (
                    <Crown className="h-6 w-6 text-white" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {isAdmin ? 'Royal Admin' : user?.username}
                </p>
                <p className="text-xs text-gray-400">
                  {isAdmin ? 'Supreme Ruler' : user?.plan || 'Knight'}
                </p>
              </div>
            </motion.div>

            <motion.button
              onClick={handleLogout}
              className="p-3 text-gray-300 hover:text-red-400 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-300 hover:text-white"
              whileTap={{ scale: 0.9 }}
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              className="md:hidden glass-morphism rounded-lg mt-4 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id)
                      setShowMobileMenu(false)
                    }}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      currentPage === item.id
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left text-red-400 hover:bg-red-500/10 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Abdicate Throne</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

export default ChessHeader