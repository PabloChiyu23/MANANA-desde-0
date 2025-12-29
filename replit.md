# MAÑANA - Lesson Planning App

## Overview
MAÑANA is a lesson planning application for teachers in Spanish-speaking countries. It generates lesson activities aligned with NEM (Nueva Escuela Mexicana) curriculum in 60 seconds.

## Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via CDN)
- **AI**: Google Gemini API (@google/genai)
- **PDF Generation**: jsPDF

## Project Structure
```
/
├── components/          # React components
│   ├── AuthModal.tsx
│   ├── CancellationModal.tsx
│   ├── EmailModal.tsx
│   ├── FavoriteLessons.tsx
│   ├── Header.tsx
│   ├── LandingPage.tsx
│   ├── LessonForm.tsx
│   ├── LessonResult.tsx
│   ├── PaymentModal.tsx
│   └── ProPanel.tsx
├── services/
│   └── ai.ts           # Gemini AI service
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── index.html          # HTML template
├── types.ts            # TypeScript types
├── vite.config.ts      # Vite configuration
└── package.json
```

## Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for AI-powered lesson generation

## Development
- **Port**: 5000
- **Command**: `npm run dev`

## Deployment
- **Type**: Static
- **Build**: `npm run build`
- **Output**: `dist/`
