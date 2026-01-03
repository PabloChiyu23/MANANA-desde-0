# MAÑANA - Lesson Planning App

## Overview
MAÑANA is a lesson planning application for teachers in Spanish-speaking countries. It generates lesson activities aligned with NEM (Nueva Escuela Mexicana) curriculum in 60 seconds.

## Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via CDN)
- **AI**: OpenAI GPT-4o-mini (via Replit AI Integrations in dev, direct API in production)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Mercado Pago
- **PDF Generation**: jsPDF

## Project Structure
```
/
├── api/                 # Vercel serverless functions
│   ├── create-preference.ts    # Create Mercado Pago payment preference
│   ├── generate-lesson.ts      # Lesson generation endpoint
│   ├── generate-planb.ts       # Plan B generation endpoint
│   └── mercadopago-webhook.ts  # Payment webhook handler
├── components/          # React components
│   ├── AuthModal.tsx
│   ├── CancellationModal.tsx
│   ├── FavoriteLessons.tsx
│   ├── Header.tsx
│   ├── LandingPage.tsx
│   ├── LessonForm.tsx
│   ├── LessonResult.tsx
│   ├── PaymentModal.tsx
│   └── ProPanel.tsx
├── lib/
│   └── supabase.ts      # Supabase client
├── server/
│   └── index.ts         # Express dev server with Vite middleware
├── services/
│   └── ai.ts            # AI service client
├── App.tsx              # Main app component
├── index.tsx            # Entry point
├── index.html           # HTML template
├── types.ts             # TypeScript types
├── vite.config.ts       # Vite configuration
└── package.json
```

## Environment Variables
### Required Secrets
- `MERCADOPAGO_ACCESS_TOKEN`: Mercado Pago API access token
- `MERCADOPAGO_WEBHOOK_SECRET`: Mercado Pago webhook signature secret
- `SUPABASE_SERVICE_KEY`: Supabase service role key (for server-side operations)

### Frontend (VITE_ prefix)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

### Backend (Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_API_KEY`: Auto-provided by Replit
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: Auto-provided by Replit

## Database Schema (Supabase)
### users
- `id` (uuid, primary key) - matches Supabase auth user id
- `email` (varchar)
- `is_pro` (bool) - PRO subscription status
- `total_generations` (int4) - count of lessons generated
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### saved_lessons
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `topic`, `grade`, `duration`, `status`, `tone`, etc.
- `content` (text) - generated lesson content
- `created_at` (timestamptz)

## Free Tier Limits
- Without account: 1 class
- With account: 10 classes
- PRO: Unlimited

## Payment Flow (Checkout Bricks)
1. User clicks "Upgrade to PRO"
2. PaymentModal opens with Mercado Pago Bricks form (in-app, no redirect)
3. User enters card details directly in the app
4. Frontend calls `/api/process-payment` with tokenized card data
5. Backend processes payment via Mercado Pago API
6. If approved, backend updates `users.is_pro = true` in Supabase
7. User sees success message immediately

### Payment Statuses
- `approved`: Payment successful, PRO activated instantly
- `pending`/`in_process`: Bank verification needed, PRO activates when confirmed
- `rejected`: Payment failed, user sees specific error message

### Required Environment Variables for Payments
- `MERCADOPAGO_ACCESS_TOKEN`: Backend (production: APP_USR-xxx)
- `VITE_MERCADOPAGO_PUBLIC_KEY`: Frontend (production: APP_USR-xxx)

## Development
- **Port**: 5000
- **Command**: `npm run dev`

## Deployment
- **Platform**: Vercel
- **Build**: `npm run build`
- **Output**: `dist/`
- Configure Mercado Pago webhook URL in their dashboard pointing to your Vercel domain
