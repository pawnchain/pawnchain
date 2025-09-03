# ForgeChain Networks - Product Requirements Document (PRD)

**Version**: 3.0  
**Last Updated**: December 2024  
**System**: P2P Triangular Pyramid Investment Platform

---

## 📋 Table of Contents

1. [Product Overview](#product-overview)
2. [System Architecture](#system-architecture)
3. [Core Features & Requirements](#core-features--requirements)
4. [Business Logic Specifications](#business-logic-specifications)
5. [User Journey & Experience](#user-journey--experience)
6. [Technical Specifications](#technical-specifications)
7. [Security & Compliance](#security--compliance)
8. [Administrative Requirements](#administrative-requirements)
9. [Performance Requirements](#performance-requirements)
10. [Future Roadmap](#future-roadmap)

---

## 🎯 Product Overview

### Mission Statement
ForgeChain Networks provides a transparent, secure, and automated P2P investment platform utilizing a triangular pyramid structure to facilitate peer-to-peer transactions and earnings distribution.

### Core Value Propositions
- **Transparent Structure**: Clear 15-position triangular hierarchy
- **Automated Processing**: Real-time transaction handling with admin oversight
- **Fair Distribution**: Position-based earnings with referral incentives
- **User-Centric Experience**: Modal-driven flows with real-time updates
- **Secure Operations**: Multi-layer security with audit trails

### Target Users
- **Primary**: Crypto-savvy investors seeking structured P2P opportunities
- **Secondary**: Users interested in referral-based earning systems
- **Administrative**: Platform operators and customer support teams

---

## 🏗️ System Architecture

### Technology Stack Requirements

#### Frontend Architecture
- **Primary Interface**: Next.js 15.5.0 with App Router + TypeScript
- **Secondary Interface**: React 18.2.0 + Vite 5.4.2 (Standalone)
- **Styling**: Tailwind CSS 4.x with responsive design
- **Animations**: Framer Motion 12.23.12 for smooth transitions
- **Icons**: Lucide React 0.541.0 for consistent iconography
- **State Management**: React Context + NextAuth.js sessions

#### Backend Architecture
- **Framework**: Next.js API Routes with TypeScript
- **Database**: MongoDB Atlas with Prisma ORM 6.14.0
- **Authentication**: NextAuth.js 4.24.11 with JWT sessions
- **Real-time**: Socket.io 4.8.1 for live updates
- **Security**: bcryptjs 3.0.2 for password hashing
- **Database Migration**: Full migration from SQLite to MongoDB with ObjectId validation

#### Development Tools
- **Linting**: ESLint 9.x with TypeScript support
- **Build Tools**: Turbopack for development, standard Next.js for production
- **Database Management**: Prisma Studio for development
- **Process Management**: concurrently 9.2.1 for dual-server development

### Dual Frontend Architecture
The system employs a unique dual frontend approach:
- **Main Application** (Port 3000): Next.js with full-stack capabilities
- **Standalone Frontend** (Port 5173): React/Vite for enhanced user experience
- **Development Command**: `npm run dev:all` starts both servers concurrently

---

## 🔥 Core Features & Requirements

### 1. Triangle Management System

#### 1.1 Position Structure
```
**Mandatory 15-Position Structure:**

        Level 1: A (1 position)
       /                 \
   Level 2: AB1          AB2 (2 positions)  
   /     \              /     \
Level 3: B1C1  B1C2  B2C1  B2C2 (4 positions)
Level 4: L4P1  L4P2  L4P3  L4P4  L4P5  L4P6  L4P7  L4P8 (8 positions)
```

#### 1.2 Position Assignment Logic
- **Referral-Based Placement**: New users placed in referrer's triangle if available
- **Fallback System**: Oldest available triangle of same plan type
- **Smart Allocation**: System automatically finds optimal position
- **Permanent Reservation**: No timeout - positions held until admin decision

#### 1.3 Triangle Completion
- **Completion Trigger**: All 15 positions filled
- **Payout Eligibility**: Position A users can request payout
- **Triangle Splitting**: Automatic promotion to new triangles post-completion

### 2. Enhanced Transaction System

#### 2.1 Transaction ID Format Specifications
- **Deposit Transactions**: `DP12345` format with auto-incrementing
- **Payout Transactions**: `WD12345` format with auto-incrementing  
- **Referral Bonus**: `RB12345` format with auto-incrementing
- **Generation**: Separate counters for each transaction type
- **Display Consistency**: Same format across UI and admin dashboard

#### 2.2 Modal Transaction Flow
**Critical Requirement**: Non-closable modals for transaction processes

**Deposit Flow Modal States:**
1. **Processing**: "Admin is processing your deposit, kindly hold on"
2. **Confirmed**: "Deposit has been confirmed" (closable)
3. **Rejected**: "Deposit was not confirmed, please reach out to admin" (triggers account deletion)

**Payout Flow Modal States:**
1. **Processing**: "Payment is being processed"
2. **Completed**: "Withdrawal has been successfully completed" (triggers account deletion)

#### 2.3 Real-time Status Updates
- **WebSocket Integration**: Live status updates via Socket.io
- **Polling Mechanism**: Backup for WebSocket failures
- **Transaction Tracking**: Unique ID display for user reference
- **Admin Notifications**: Instant updates to connected admin dashboards

### 3. User Status & Account Management

#### 3.1 User Status System
- **PENDING**: Initial state upon registration
- **CONFIRMED**: Status after admin confirms deposit
- **Status Transition**: Triggers referral bonus processing

#### 3.2 Account Deletion Logic
**Soft Delete Implementation:**
- **Trigger Events**: Deposit rejection, successful payout completion
- **Process**: Set `deletedAt` timestamp, rename username/wallet
- **Position Cleanup**: Free triangle position for new users
- **Transaction Marking**: Mark all transactions as CONSOLIDATED
- **Admin Filtering**: Exclude deleted users from admin dashboard

#### 3.3 Redirect Handling
- **Centralized Logic**: TransactionModal handles logout and redirect
- **Sequence**: `await logout(); window.location.href = '/register';`
- **Target Destination**: Registration page for account deletion scenarios

### 4. Referral & Bonus System

#### 4.1 Referral Code Support
**Multiple Format Support:**
- Full user ID (MongoDB ObjectId format: 24-character hexadecimal)
- Username (exact match)
- Short code (last 8 characters of ObjectId)
- Case-insensitive matching with clear error messaging
- ObjectId validation to prevent database errors

**ObjectId Validation Logic:**
```typescript
// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
```

**Multi-Strategy Lookup:**
1. **Exact ObjectId Match**: If referral code is valid 24-character ObjectId
2. **Username Match**: Direct username lookup for user-friendly codes
3. **Partial ID Match**: Search all users for ObjectId ending with provided string

#### 4.2 Referral Bonus Processing
- **Bonus Amount**: 10% of plan price
- **Trigger**: Admin confirms referred user's deposit
- **Status Dependency**: Only when referred user becomes CONFIRMED
- **Transaction Creation**: Automatic RB-format transaction ID
- **Relationship Tracking**: Explicit referrer-referred user linking

#### 4.3 Plan Alignment
- **Automatic Assignment**: Referred users join referrer's plan type
- **Triangle Placement**: Priority placement in referrer's triangle
- **Position Hierarchy**: Child positions relative to referrer

### 5. Earnings & Payout System

#### 5.1 Earnings Calculation
**Position-Based Multipliers:**
- **Level 1 (Position A)**: 4x plan amount
- **Level 2 (AB1, AB2)**: 3x plan amount  
- **Level 3 (B1C1, B1C2, B2C1, B2C2)**: 2x plan amount
- **Level 4 (L4P1-L4P8)**: 1x plan amount

#### 5.2 Available Balance Calculation
- **Components**: Referral bonuses + Plan earnings
- **Plan Earnings**: Only credited when triangle is complete
- **Real-time Updates**: Live balance updates via WebSocket
- **Display Label**: "Plan Earnings" (not "Total Earned")

#### 5.3 Payout Requirements
- **Eligibility**: Position A users only
- **Triangle Status**: Must be 100% complete (15/15 positions)
- **Process**: Modal flow with transaction ID tracking
- **Completion**: Account deletion upon successful payout

---

## 👤 User Journey & Experience

### Registration Flow
1. **Landing Page**: Clear value proposition and plan selection
2. **Registration Form**: Username, wallet address, password, referral code (optional)
3. **Plan Selection**: KING, QUEEN, BISHOP, KNIGHT with pricing
4. **Position Assignment**: Immediate triangle position reservation
5. **Deposit Instructions**: Wallet details, amount, network information
6. **Confirmation**: "I have deposited" button triggers modal flow

### Dashboard Experience
1. **Welcome Screen**: Personalized greeting with user statistics
2. **Balance Display**: Current balance, plan earnings, referral bonuses
3. **Triangle Visualization**: Interactive position grid with completion status
4. **Quick Actions**: Invite friends, request payout, view triangle details
5. **Recent Activity**: Transaction history with status updates

### Transaction Processing
1. **Deposit Confirmation**: Non-closable modal with transaction ID
2. **Real-time Updates**: Live status changes from admin actions
3. **Completion Handling**: Success/rejection with appropriate actions
4. **Account Lifecycle**: Automatic deletion for rejection/completion scenarios

### Payout Journey
1. **Eligibility Check**: Position A + complete triangle validation
2. **Payout Request**: Amount and wallet confirmation
3. **Processing Modal**: Transaction ID display with admin processing status
4. **Completion**: Success message with account deletion notice
5. **Re-registration**: Clear path to rejoin with new account

---

## 🔧 Technical Specifications

### Database Schema Requirements

#### Core Models
```typescript
// User Model - Enhanced for MongoDB
model User {
  id            String     @id @default(auto()) @map("_id") @db.ObjectId
  username      String     @unique
  walletAddress String     @unique  
  passwordHash  String
  planType      PlanType
  status        UserStatus @default(PENDING)
  isAdmin       Boolean    @default(false)
  deletedAt     DateTime?  // Soft delete timestamp
  
  // Referral relationships
  referrer      User?      @relation("ReferralRelation")
  referrals     User[]     @relation("ReferralRelation")
  
  // Triangle and transaction relationships
  positions     Position[]
  transactions  Transaction[]
  referralBonusesFor Transaction[] @relation("ReferralBonusFor")
}

// Transaction Model - Enhanced for MongoDB
model Transaction {
  id             String            @id @default(auto()) @map("_id") @db.ObjectId
  type          TransactionType
  amount        Float
  status        TransactionStatus
  txHash        String?           // Formatted transaction ID (DP12345, etc.)
  modalShown    Boolean           @default(false)
  rejectionReason String?
  
  // Enhanced referral tracking
  referredUser   User?    @relation("ReferralBonusFor")
  referredUserId String?  @db.ObjectId // Only for REFERRAL_BONUS transactions
}
```

#### Enhanced Enums
```typescript
enum UserStatus {
  PENDING    // Initial registration state
  CONFIRMED  // After admin confirms deposit
}

enum TransactionStatus {
  PENDING      // Awaiting admin action
  CONFIRMED    // Admin approved
  REJECTED     // Admin rejected
  COMPLETED    // Payout completed
  CONSOLIDATED // Account deleted, transactions archived
}
```

## 🛠️ Technical Specifications

### Database Architecture

#### MongoDB Migration Specifications
**Migration from SQLite to MongoDB Atlas:**
- **Database Provider**: MongoDB Atlas cloud service
- **ORM Compatibility**: Prisma 6.14.0 with MongoDB connector
- **ID Format**: MongoDB ObjectId (24-character hexadecimal)
- **Schema Conversion**: All models updated with proper ObjectId references
- **Referential Actions**: Explicit onDelete and onUpdate specifications

#### Database Schema Requirements
```typescript
// Core User Model (MongoDB)
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  username      String    @unique
  walletAddress String    @unique
  passwordHash  String
  planType      PlanType
  status        UserStatus @default(PENDING)
  isAdmin       Boolean   @default(false)
  deletedAt     DateTime?
  referrerId    String?   @db.ObjectId
  
  // Relations with proper referential actions
  referrer      User?     @relation("ReferralRelation", fields: [referrerId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  referrals     User[]    @relation("ReferralRelation")
  positions     Position[]
  transactions  Transaction[]
}
```

#### Connection String Management
- **Environment Variable**: DATABASE_URL with MongoDB Atlas format
- **Password Encoding**: Special characters URL-encoded (@ becomes %40)
- **Security**: Connection string stored securely in environment
- **Validation**: Connection testing via migration scripts

#### ObjectId Validation Requirements
- **Referral Code Handling**: Safe validation before database queries
- **Multi-Strategy Lookup**: Exact ObjectId, username, partial match
- **Error Prevention**: Avoid malformed ObjectId exceptions
- **Performance**: Efficient query patterns for different lookup types

### API Endpoint Requirements

#### Authentication Endpoints
- `POST /api/auth/register` - Enhanced with referral code support
- `POST /api/auth/forgot-password` - Wallet-based recovery
- `GET /api/auth/referrer/[code]` - Multi-format referral lookup

#### Transaction Management
- `GET /api/transactions/[id]/status` - Real-time status polling
- `POST /api/transactions/deposit-confirm` - User deposit confirmation
- `POST /api/user/delete-account` - Account deletion with cleanup

#### Admin Management
- `GET /api/admin/users` - Filtered to exclude deleted users
- `POST /api/admin/transactions/[id]/confirm` - Admin approval system
- `PUT /api/admin/transactions/[id]/reject` - Admin rejection system

### Real-time Requirements
- **WebSocket Events**: Transaction status updates, admin notifications
- **Connection Management**: Automatic reconnection handling
- **Event Broadcasting**: Multi-client synchronization
- **Fallback Mechanism**: Polling for WebSocket failures

---

## 🛡️ Security & Compliance

### Authentication Security
- **Password Requirements**: Minimum 6 characters with bcrypt hashing
- **Session Management**: JWT with 24-hour expiration
- **Rate Limiting**: 5 attempts with 15-minute lockout
- **Wallet Verification**: Primary account recovery method

### Data Protection
- **Soft Delete**: Preserve audit trails while hiding deleted users
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **XSS Prevention**: React's built-in protection + validation

### Admin Security
- **Environment-based Credentials**: Admin username from environment
- **Route Protection**: Middleware-enforced admin access
- **Action Logging**: Comprehensive audit trail for admin actions
- **Session Isolation**: Separate admin and user session management

### Transaction Security
- **ID Uniqueness**: Auto-incrementing with type-specific prefixes
- **Status Validation**: State machine enforcement for transaction flow
- **Account Cleanup**: Secure deletion with position release
- **Balance Protection**: Earnings calculation validation

---

## ⚙️ Administrative Requirements

### Admin Dashboard Features
- **User Management**: View active users (excluding deleted)
- **Transaction Oversight**: Approve/reject with real-time notifications
- **Plan Configuration**: Dynamic pricing updates
- **System Statistics**: Active triangles, completion rates, user metrics

### Administrative Workflows
1. **Deposit Processing**:
   - Review user payment confirmation
   - Verify external transaction
   - Approve/reject with reason
   - Automatic user notification

2. **Payout Processing**:
   - Validate payout eligibility
   - Process external payment
   - Mark as completed
   - Trigger account deletion

3. **User Support**:
   - Transaction ID lookup
   - Account status verification
   - Manual intervention capabilities
   - Audit trail access

### Configuration Management
- **Plan Pricing**: Admin-configurable amounts for all plans
- **System Settings**: Deposit wallet, network, coin configuration
- **Feature Flags**: Toggle system features as needed
- **Maintenance Mode**: System-wide maintenance capabilities

---

## 📊 Performance Requirements

### Response Time Standards
- **Page Load**: < 2 seconds for dashboard
- **API Responses**: < 500ms for standard requests
- **Real-time Updates**: < 100ms for WebSocket events
- **Database Queries**: Optimized with proper indexing

### Scalability Requirements
- **Concurrent Users**: Support 1000+ simultaneous users
- **Transaction Volume**: Handle 10,000+ transactions/day
- **Database Performance**: Efficient queries with proper indexing
- **Memory Usage**: Optimized component rendering and state management

### Availability Requirements
- **Uptime Target**: 99.9% availability
- **Error Handling**: Graceful degradation for failed operations
- **Backup Systems**: Automated database backups
- **Recovery Procedures**: Quick restoration capabilities

---

## 🚀 Future Roadmap

### Phase 1 Enhancements (Q1 2025)
- **Mobile Application**: Native iOS and Android apps
- **Enhanced Analytics**: Detailed user and system analytics
- **Multi-language Support**: Internationalization framework
- **Advanced Notifications**: Email and SMS integration

### Phase 2 Features (Q2 2025)
- **Multi-currency Support**: Additional cryptocurrency options
- **Advanced Referral Tiers**: Multi-level referral bonuses
- **Automated KYC**: Identity verification integration
- **Performance Optimization**: Caching and CDN implementation

### Phase 3 Innovations (Q3 2025)
- **Smart Contract Integration**: Blockchain-based automation
- **Advanced Triangle Types**: Additional geometric structures
- **AI-powered Insights**: Predictive analytics and recommendations
- **API Gateway**: Third-party integration capabilities

---

## 📋 Acceptance Criteria

### Core Functionality
- ✅ User registration with referral code support
- ✅ Automatic triangle position assignment
- ✅ Modal-based transaction flows
- ✅ Real-time status updates
- ✅ Admin approval/rejection system
- ✅ Automatic account deletion
- ✅ Referral bonus processing
- ✅ Position-based earnings calculation
- ✅ MongoDB migration and ObjectId validation
- ✅ Multi-strategy referral code lookup
- ✅ Database connection string encoding

### User Experience
- ✅ Responsive design across all devices
- ✅ Intuitive navigation and user flows
- ✅ Clear transaction status communication
- ✅ Non-intrusive real-time updates
- ✅ Comprehensive error handling

### Administrative Tools
- ✅ Complete transaction oversight
- ✅ User management capabilities
- ✅ System configuration options
- ✅ Performance monitoring tools
- ✅ Audit trail maintenance

### Security & Compliance
- ✅ Secure authentication system
- ✅ Data protection measures
- ✅ Input validation and sanitization
- ✅ Session management
- ✅ Audit logging

---

## 📞 Support & Maintenance

### Documentation Requirements
- Comprehensive API documentation
- User guide and tutorials
- Admin operation manual
- Technical architecture documentation
- Deployment and maintenance guides

### Monitoring & Analytics
- Real-time system health monitoring
- User behavior analytics
- Transaction volume tracking
- Error rate monitoring
- Performance metrics dashboard

### Maintenance Procedures
- Regular security updates
- Database maintenance and optimization
- User data cleanup procedures
- System backup and recovery
- Performance tuning protocols
- MongoDB database restoration using scripts/restore-plans-and-admin.js

### Database Initialization Scripts
- **Restoration Script**: `node scripts/restore-plans-and-admin.js`
  - Creates admin user with default credentials
  - Initializes plan configurations (KING, QUEEN, BISHOP, KNIGHT)
  - Sets up system configuration settings
  - Validates database connections and schema

---

**Document Prepared By**: ForgeChain Development Team  
**Approval Required**: Product Owner, Technical Lead, Compliance Officer  
**Next Review Date**: Quarterly Updates Required

---

*This PRD serves as the authoritative specification for ForgeChain Networks v3.0 and should be referenced for all development, testing, and deployment activities.*