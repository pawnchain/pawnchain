export interface User {
  id: string
  username: string
  walletAddress: string
  plan: PlanType
  trianglePosition?: number
  triangleId?: string
  trianglePositions?: Position[]
  referralCode: string
  uplineId?: string
  balance: number
  totalEarned: number
  createdAt: Date
}

export interface Position {
  id: string
  userId: string
  triangleId: string
  position: number
  user?: User
  triangle?: Triangle
}

export interface Triangle {
  id: string
  positions: (User | null)[]
  planType: PlanType
  completedAt?: Date
  payoutProcessed: boolean
}

export interface Transaction {
  id: string
  userId: string
  type: 'deposit' | 'payout' | 'referral'
  amount: number
  status: 'pending' | 'confirmed' | 'rejected' | 'completed'
  transactionId?: string
  createdAt: Date
  expiresAt?: Date
}

export interface Plan {
  name: PlanType
  price: number
  payout: number
  referralBonus: number
}

export type PlanType = 'King' | 'Queen' | 'Bishop' | 'Knight'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  read: boolean
  createdAt: Date
}

export interface AdminStats {
  totalUsers: number
  activeTriangles: number
  pendingDeposits: number
  pendingPayouts: number
  totalRevenue: number
}