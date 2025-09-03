# ForgeChain Networks

A peer-to-peer triangular pyramid investment system designed to manage user referrals, investments, and payouts through a structured 15-position hierarchical tree.

## Project Overview

ForgeChain Networks enables users to earn referral bonuses and receive payouts upon triangle completion. The system features:

- Structured referral tracking with multi-format support (ObjectId, username, short code)
- Secure and auditable transaction lifecycle with real-time status updates
- Automated position assignment and triangle completion logic
- Admin-controlled deposit and payout confirmation for security

## System Architecture

The system follows a **Next.js App Router-based full-stack architecture** with dual frontend support:

- **Main application**: Next.js 15 (React Server Components)
- **Standalone frontend**: React/Vite
- **Backend**: API routes in Next.js with Prisma ORM
- **Database**: MongoDB
- **Real-time communication**: Socket.io

## Technology Stack

### Backend
- Next.js 15.5.0
- TypeScript 5.x
- Prisma ORM 6.14.0
- MongoDB
- NextAuth.js 4.24.11 with JWT
- Socket.io 4.8.1

### Frontend
- React 18.2.0
- Vite
- Tailwind CSS 4.x
- Framer Motion
- Lucide React icons

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd forgechain

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npx prisma generate
npx prisma db push

# Create admin user
npm run create:admin
```

### Development

```bash
# Start development servers
npm run dev:all  # Runs both Next.js and Vite frontend
```

### Build

```bash
# Build the application
npm run build          # Build Next.js app
npm run build:frontend # Build Vite frontend
npm run build:all      # Build both
```

## Deployment

### Vercel (Recommended)

```bash
npx vercel link
# Set environment variables in dashboard
npx vercel --prod
```

### Manual Deployment

```bash
npm run build:all
npx prisma generate
npx prisma db push
npm start
```

## Project Structure

```
├── backend/           # Next.js application
│   ├── app/           # App Router with pages and API routes
│   ├── components/    # Shared UI components
│   ├── lib/           # Core business logic
│   ├── prisma/        # Database schema and migrations
│   └── scripts/       # Setup and maintenance scripts
├── frontend/          # Standalone React/Vite application
│   ├── src/           # Source code
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   └── types/      # TypeScript definitions
│   └── vite.config.ts  # Vite configuration
└── README.md          # This file
```

## Security

- Input validation on all endpoints
- JWT with secure secret
- Admin route protection via middleware
- Rate limiting on authentication (5 login attempts before 15-minute lockout)
- Soft delete with audit trail preservation

## License

This is proprietary software. No open-source contribution allowed.