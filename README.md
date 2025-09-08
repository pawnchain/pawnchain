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
- React 18.3.1
- Next.js 15.1.0 (App Router)
- Tailwind CSS 3.4.0
- Framer Motion 11.0.0
- Lucide React 0.344.0

## Changelog

For a detailed history of changes, please see [CHANGELOG.md](CHANGELOG.md).

## Recent Updates

### Dashboard and Wallet Display Fixes
- Fixed Royal Treasury Balance calculation on user dashboard to match wallet page values
- Corrected Total Conquered display to show position earnings instead of total earned
- Updated Position Rewards calculation to use current position earnings
- Ensured consistent earnings calculations across dashboard and wallet components

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
# Start development server
npm run dev
```

*Note: The PRD references `npm run dev:all` for running dual frontend servers, but this script is not currently implemented in package.json.*

### Build

```bash
# Build the application
npm run build
```

*Note: The PRD references `build:frontend` and `build:all` scripts which are not currently implemented in package.json.*

## Deployment

### Vercel (Recommended)

```bash
npx vercel link
# Set environment variables in dashboard
npx vercel --prod
```

### Manual Deployment

```bash
npm run build
npx prisma generate
npx prisma db push
npm start
```

## Project Structure

```
├── src/               # Main source code
│   ├── app/           # App Router with pages and API routes
│   ├── components/    # Shared UI components
│   ├── contexts/      # React contexts
│   ├── lib/           # Core business logic
│   └── types/         # TypeScript definitions
├── prisma/            # Database schema and migrations
├── scripts/           # Setup and maintenance scripts
├── PRD.md             # Product Requirements Document
├── TRIANGLE_ASSIGNMENT.md # Triangle assignment logic documentation
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