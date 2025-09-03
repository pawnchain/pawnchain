'use client'

import React, { useState, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { useAuth } from '@/contexts/AuthContext'
import ChessHeader from '@/components/Layout/ChessHeader'
import ChessLoginForm from '@/components/Auth/ChessLoginForm'
import ChessRegisterForm from '@/components/Auth/ChessRegisterForm'
import ChessForgotPassword from '@/components/Auth/ChessForgotPassword'
import ChessDepositInstructions from '@/components/Deposit/ChessDepositInstructions'
import ChessDashboard from '@/components/Dashboard/ChessDashboard'
import ChessTriangleView from '@/components/Triangle/ChessTriangleView'
import ChessTriangleDetail from '@/components/Triangle/ChessTriangleDetail'
import ChessWallet from '@/components/Wallet/ChessWallet'
import ChessReferrals from '@/components/Referrals/ChessReferrals'
import ChessAdminDashboard from '@/components/Admin/ChessAdminDashboard'
import ChessAdminUsers from '@/components/Admin/ChessAdminUsers'
import ChessAdminTransactions from '@/components/Admin/ChessAdminTransactions'
import ChessAdminTriangles from '@/components/Admin/ChessAdminTriangles'
import ChessAdminPlans from '@/components/Admin/ChessAdminPlans'
import ChessAdminSettings from '@/components/Admin/ChessAdminSettings'
import ChessNotificationContainer from '@/components/Notifications/ChessNotificationContainer'

const AppContent: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [currentPage, setCurrentPage] = useState('login')
  const [pendingDeposit, setPendingDeposit] = useState<any>(null)

  const handleNavigate = (page: string) => {
    console.log('Navigating to:', page)
    setCurrentPage(page)
    
    // Dispatch a custom event to notify components of navigation
    const event = new CustomEvent('navigate', { detail: page });
    window.dispatchEvent(event);
  }

  const refreshUserData = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      console.log('Refreshed user session:', session)
    } catch (error) {
      console.error('Failed to refresh user session:', error)
    }
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (typeof detail === 'string') setCurrentPage(detail)
    }
    window.addEventListener('navigate', handler as EventListener)
    return () => window.removeEventListener('navigate', handler as EventListener)
  }, [])

  useEffect(() => {
    const pending = localStorage.getItem('pending_deposit')
    if (pending) {
      try {
        const deposit = JSON.parse(pending)
        setPendingDeposit(deposit)
        // Only navigate to deposit-instructions if we're not already on a page that handles deposits
        if (currentPage !== 'deposit-instructions' && currentPage !== 'dashboard') {
          setCurrentPage('deposit-instructions')
        }
      } catch (e) {
        localStorage.removeItem('pending_deposit')
      }
    }
  }, [])

  const renderPage = () => {
    console.log('App renderPage - State:', {
      pendingDeposit: !!pendingDeposit,
      currentPage,
      user: !!user,
      isAdmin
    })

    // Handle deposit instructions page
    if (currentPage === 'deposit-instructions') {
      // Get deposit info from localStorage
      const pending = localStorage.getItem('pending_deposit')
      if (pending) {
        try {
          const deposit = JSON.parse(pending)
          return (
            <ChessDepositInstructions
              depositInfo={deposit}
              onModalClose={() => {
                console.log('Modal closing - navigating to dashboard')
                localStorage.removeItem('pending_deposit')
                setPendingDeposit(null)
                refreshUserData().then(() => {
                  setTimeout(() => {
                    setCurrentPage('dashboard')
                    // Dispatch navigation event
                    const event = new CustomEvent('navigate', { detail: 'dashboard' });
                    window.dispatchEvent(event);
                    console.log('Navigation to dashboard complete')
                  }, 100)
                })
              }}
              onAccountDelete={() => {
                localStorage.removeItem('pending_deposit')
                setPendingDeposit(null)
                setCurrentPage('login')
                // Dispatch navigation event
                const event = new CustomEvent('navigate', { detail: 'login' });
                window.dispatchEvent(event);
              }}
            />
          )
        } catch (e) {
          localStorage.removeItem('pending_deposit')
        }
      }
      // If no pending deposit, fall through to normal navigation
    }

    if (!user && !isAdmin) {
      switch (currentPage) {
        case 'register':
          return <ChessRegisterForm onNavigate={handleNavigate} />
        case 'forgot-password':
          return <ChessForgotPassword onNavigate={handleNavigate} />
        default:
          return <ChessLoginForm onNavigate={handleNavigate} />
      }
    }

    if (isAdmin) {
      return (
        <div className="min-h-screen">
          <ChessHeader onNavigate={handleNavigate} currentPage={currentPage} />
          <main>
            {(() => {
              switch (currentPage) {
                case 'admin-users':
                  return <ChessAdminUsers />
                case 'admin-transactions':
                  return <ChessAdminTransactions />
                case 'admin-triangles':
                  return <ChessAdminTriangles />
                case 'admin-plans':
                  return <ChessAdminPlans />
                case 'admin-settings':
                  return <ChessAdminSettings />
                default:
                  return <ChessAdminDashboard />
              }
            })()}
          </main>
        </div>
      )
    }

    if (user) {
      return (
        <div className="min-h-screen">
          <ChessHeader onNavigate={handleNavigate} currentPage={currentPage} />
          <main>
            {(() => {
              switch (currentPage) {
                case 'triangle':
                  return <ChessTriangleView />
                case 'triangle-detail':
                  return <ChessTriangleDetail />
                case 'wallet':
                  return <ChessWallet />
                case 'referrals':
                  return <ChessReferrals />
                default:
                  return <ChessDashboard onNavigate={handleNavigate} />
              }
            })()}
          </main>
        </div>
      )
    }

    return <ChessLoginForm onNavigate={handleNavigate} />
  }

  return (
    <div className="App">
      {renderPage()}
      <ChessNotificationContainer />
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}