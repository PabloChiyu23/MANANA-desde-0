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
│   ├── supabase.ts      # Supabase client
│   └── prompts.ts       # AI system prompts by educational level
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

## Payment Flow (Checkout Bricks + Subscriptions)
1. User clicks "Upgrade to PRO"
2. PaymentModal opens with Mercado Pago Bricks form (in-app)
3. User enters card details directly in the app
4. Frontend calls `/api/process-payment` with tokenized card data
5. Backend processes first payment via Mercado Pago API
6. If approved, backend updates `users.is_pro = true` in Supabase
7. User sees success message immediately

### Subscription Pricing
- **Until January 6, 2026**: $29 MXN/month (promotional price)
- **After January 6, 2026**: $49 MXN/month (regular price)
- Users who subscribe during promo keep the $29 rate as long as subscription is active

### Payment Statuses
- `approved`: Payment successful, PRO activated instantly
- `pending`/`in_process`: Bank verification needed, PRO activates when confirmed
- `rejected`: Payment failed, user sees specific error message
- `authorized`: Subscription active, automatic monthly billing

### API Endpoints for Payments
- `POST /api/process-payment`: Process single payment with Checkout Bricks
- `POST /api/create-subscription`: Create Mercado Pago subscription
- `GET /api/subscription-price`: Get current price (promo or regular)
- `POST /api/mercadopago-webhook`: Handle payment/subscription notifications

### Required Environment Variables for Payments
- `MERCADOPAGO_ACCESS_TOKEN`: Backend (production: APP_USR-xxx)
- `VITE_MERCADOPAGO_PUBLIC_KEY`: Frontend (production: APP_USR-xxx)

## AI Prompts System
The lesson generator uses level-specific prompts that automatically detect the educational level from the grade selection:

### Levels and Phases
- **Preescolar (Fase 2)**: 1°, 2°, 3° Preescolar
- **Primaria**: Fase 3 (1°-2°), Fase 4 (3°-4°), Fase 5 (5°-6°)
- **Secundaria (Fase 6)**: 1°, 2°, 3° Secundaria

### NEM Compliance
All prompts enforce:
- **4 Campos Formativos**: Lenguajes, Saberes y Pensamiento Científico, Ética Naturaleza y Sociedades, De lo Humano y lo Comunitario
- **7 Ejes Articuladores**: Inclusión, Pensamiento Crítico, Interculturalidad Crítica, Igualdad de Género, Vida Saludable, Lectura/Escritura, Artes y Experiencias Estéticas
- **Prohibitions**: No traditional subjects, no 2011/2017 competencies, no old learning expectations

### Level-Specific Characteristics
- **Preescolar**: Ludic approach, short activities (10-15 min), body movement, songs/rhymes
- **Primaria**: Community projects, collaborative work, age-appropriate duration (15-25 min)
- **Secundaria**: Critical thinking, debates, real-world projects, student autonomy

## Development
- **Port**: 5000
- **Command**: `npm run dev`

## Deployment
- **Platform**: Vercel
- **Build**: `npm run build`
- **Output**: `dist/`
- Configure Mercado Pago webhook URL in their dashboard pointing to your Vercel domain
