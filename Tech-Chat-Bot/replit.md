# Saudi Health Coach - كوتش الصحة

## Overview

A personal health assistant chatbot designed for Saudi Arabic users. The application provides diet plans, workout tips, meal tracking, and injury advice through a conversational AI interface. The bot speaks in modern Saudi dialect (Riyadh/White dialect) and acts as a friendly but strict health coach persona.

Key features:
- AI-powered chat with OpenAI integration via Replit AI Integrations
- Meal scanning and food logging with gamification
- Weekly meal plans with Saudi-friendly healthy recipes
- Ramadan mode for fasting schedules
- User onboarding and profile management
- Voice chat capabilities

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, localStorage for user profile persistence
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for UI transitions
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a feature-based organization:
- `/pages` - Route components (Home, Onboarding, NotFound)
- `/components/chat` - Chat interface components
- `/components/features` - Feature modules (Tracker, MealScanner, WeeklyPlan, etc.)
- `/components/ui` - Reusable shadcn/ui components
- `/lib` - Utilities and bot logic

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: REST endpoints under `/api/*`
- **Build**: esbuild for production bundling with selective dependency bundling

The server handles:
- Chat API endpoint (`/api/chat`) for AI conversations
- Static file serving in production
- Vite dev server middleware in development

### AI Integration
- Uses Replit AI Integrations for OpenAI access (no API key management needed)
- System prompt defines the "كوتش الصحة" (Health Coach) persona with Saudi dialect
- Supports structured JSON outputs for meal plans and health data
- Voice chat integration available via audio processing utilities

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Users table, Conversations table, Messages table for chat history
- **Session Storage**: In-memory storage for development, connect-pg-simple for production sessions
- **Client Storage**: localStorage for user profiles and chat history

### Authentication
- Basic user schema with username/password defined in schema
- Session-based authentication infrastructure available but not fully implemented
- User profiles stored client-side in localStorage

## External Dependencies

### AI Services
- **OpenAI API**: Accessed via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- Supports GPT models for chat and `gpt-image-1` for image generation

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with Zod schema validation

### Third-Party Libraries
- **canvas-confetti**: Celebration animations for gamification
- **react-markdown**: Rendering markdown in chat messages
- **date-fns**: Date manipulation utilities
- **p-limit/p-retry**: Batch processing with rate limiting for AI calls

### Fonts
- Cairo and IBM Plex Sans Arabic from Google Fonts for RTL Arabic support

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Development tooling
- `@replit/vite-plugin-dev-banner`: Development environment indicator