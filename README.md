# ConvoSim — AI Conversation Simulator

A full-stack web app for practicing high-stakes conversations with realistic AI personas. Think of it as a flight simulator for real-life conversations — salary negotiations, job interviews, conflict resolution, sales pitches, and more.

**Live demo:** [ai-convo-simulator.vercel.app](https://ai-convo-simulator.vercel.app)

---

## What it does

- Choose a scenario (salary negotiation, job interview, difficult coworker, etc.)
- Configure the other person's personality (all 16 MBTI types) and difficulty level
- Have a live conversation with a streaming AI persona that stays in character
- Get detailed structured feedback on your performance after each session: scores, strengths, weaknesses, key moments, suggested better responses, and personality-specific coaching
- Supports English and Roman Urdu

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript, Tailwind CSS) |
| Backend | FastAPI (Python), Server-Sent Events for streaming |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Database & Auth | Supabase (PostgreSQL + Row Level Security + email/password auth) |
| Deployment | Vercel (frontend) · Railway (backend) |

---

## Project structure

```
├── frontend/          # Next.js 15 app
│   └── src/
│       ├── app/       # Pages: landing, login, dashboard, scenarios, session, feedback
│       └── lib/       # API client, Supabase client, shared types
├── backend/           # FastAPI app
│   ├── routers/       # chat, sessions, scenarios, feedback endpoints
│   └── services/      # Groq client, MBTI personality prompts, feedback analyzer
└── supabase/
    └── migrations/    # DB schema + seed scenarios
```

---

## Running locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase project
- Groq API key

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env       # fill in your keys
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

### Environment variables

**Backend `.env`:**
```
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor. This creates the tables, RLS policies, and seeds 6 starter scenarios.

---

## Features

- **16 MBTI personalities** — each with distinct behavioral traits, resistance patterns, and speech styles
- **3 difficulty levels** — Easy, Medium, Hard (controls how hard the AI pushes back)
- **Streaming responses** — AI replies token-by-token via SSE for a real conversation feel
- **Structured feedback** — overall score, 4 skill scores (clarity, persuasion, emotional control, adaptability), strengths, weaknesses, key moments, and suggested better responses
- **Multi-language** — English and Roman Urdu supported for both conversation and feedback
- **Session history** — dashboard showing all past sessions with scores
- **Email/password auth** — sign up, sign in, and password reset via Supabase

---

## Deployment

- **Frontend** → Vercel. Set root directory to `frontend/`, add env vars.
- **Backend** → Railway. Auto-detects Python via nixpacks. Set `ALLOWED_ORIGINS` to your Vercel URL.
