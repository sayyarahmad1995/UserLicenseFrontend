# EazeCad License Server - Frontend

Next.js 14 SSR web application for managing users and software licenses.

## Tech Stack

- **Next.js 14** — React framework with App Router (SSR)
- **TypeScript** — Type safety
- **TailwindCSS** — Styling
- **shadcn/ui** — Component library
- **TanStack Query** — Data fetching and caching
- **React Hook Form + Zod** — Form validation
- **Axios** — HTTP client with interceptors
- **Sonner** — Toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running at `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your API URL
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard (protected)
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   └── providers.tsx      # React Query provider
├── hooks/                 # Custom React Query hooks
│   ├── use-auth.ts
│   ├── use-users.ts
│   ├── use-licenses.ts
│   └── use-dashboard.ts
├── services/              # API service layer
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── license.service.ts
│   └── dashboard.service.ts
├── types/                 # TypeScript types
│   └── api.ts
└── lib/
    ├── api-client.ts      # Axios instance with interceptors
    └── utils.ts           # Utilities
```

## Features

- ✅ JWT authentication (access + refresh tokens)
- ✅ Automatic token refresh on 401
- ✅ Type-safe API client
- ✅ React Query data fetching with caching
- ✅ Form validation with Zod
- ✅ Toast notifications
- ✅ Responsive UI with TailwindCSS
- ✅ SSR for better SEO and performance

## API Integration

The frontend integrates with the EazeCad backend API:

- **Auth**: Login, register, refresh, logout
- **Users**: CRUD operations, status management
- **Licenses**: CRUD, activation tracking, revocation
- **Dashboard**: Stats, audit logs, health checks

All API calls use the `apiClient` with automatic token management.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## License

MIT
