# Anima — Jungian Depth Psychology Platform

A full-stack psychological platform built with Next.js, Clerk, Supabase, and the Anthropic API (Claude). Features Active Imagination, Archetype exploration, Individuation journey tracking, and multi-turn Sessions with a Claude-powered Jung AI persona.

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Styling | Tailwind CSS |
| Deploy | Vercel |

---

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

**Clerk** — [clerk.com](https://clerk.com)
1. Create a new application
2. Copy Publishable Key and Secret Key from Dashboard → API Keys

**Supabase** — [supabase.com](https://supabase.com)
1. Create a new project
2. Copy the Project URL and `anon` key from Settings → API
3. Copy the `service_role` key (keep this server-side only)

**Anthropic** — [console.anthropic.com](https://console.anthropic.com)
1. Create an API key

### 3. Set up Supabase database

Run the following SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New query):

```sql
-- Journal entries (Active Imagination, Archetypes, Individuation)
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('active_imagination','archetype','individuation')),
  content TEXT NOT NULL,
  ai_response TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their entries"
  ON journal_entries
  FOR ALL
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub'));

-- Multi-turn Jung sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT DEFAULT 'Untitled Session',
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their sessions"
  ON sessions
  FOR ALL
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub'));

-- Individuation progress (one row per user)
CREATE TABLE individuation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  current_stage INTEGER DEFAULT 0,
  stage_notes JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE individuation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their progress"
  ON individuation_progress
  FOR ALL
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub'));
```

### 4. Configure Clerk JWT template for Supabase RLS

To enable Row Level Security with Clerk user IDs:

1. In Clerk Dashboard → JWT Templates → New template → **Supabase**
2. Name it `supabase`
3. The template should include `{ "sub": "{{user.id}}" }` — this is the default
4. Copy the **JWKS URL** from Clerk
5. In Supabase Dashboard → Authentication → JWT Settings → paste the JWKS URL

> **Note:** Without this step, the app still works — but Supabase RLS won't enforce per-user data isolation. The API routes use `user_id` filtering as a fallback.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

```bash
npx vercel
```

Or connect the GitHub repo to Vercel and add environment variables in:
**Project Settings → Environment Variables**

Add all variables from `.env.local`.

---

## Project Structure

```
app/
├── (auth)/
│   ├── sign-in/        # Clerk sign-in
│   └── sign-up/        # Clerk sign-up
├── (dashboard)/
│   ├── layout.tsx      # Protected layout with sidebar nav
│   ├── page.tsx        # Dashboard home
│   ├── active-imagination/
│   ├── archetypes/
│   ├── individuation/
│   └── sessions/
├── api/
│   ├── jung/           # Claude streaming AI endpoint
│   ├── journal/        # Journal CRUD
│   ├── sessions/       # Sessions CRUD
│   └── individuation/  # Progress upsert
├── layout.tsx          # Root layout (ClerkProvider)
└── page.tsx            # Landing page
components/
├── Navigation.tsx
└── JungChat.tsx
lib/
├── supabase.ts         # Browser Supabase client
├── supabase-server.ts  # Server Supabase client (with Clerk JWT)
└── anthropic.ts        # Anthropic client + Jung system prompt
types/index.ts          # Shared types, archetypes, paintings, stages
middleware.ts           # Clerk route protection
```

---

## Features

- **Active Imagination** — 6 archetypal paintings (Friedrich, van Gogh, Redon, Turner, Goya, Böcklin). Write reflections and receive Jung's analytical response. Auto-saved to journal.
- **Archetypes** — 8 Jungian archetypes (Shadow, Anima, Animus, Hero, Wise Old Man, Great Mother, Trickster, Self). Select, reflect, receive archetypal amplification.
- **Individuation** — 5-stage journey tracker (Persona → Shadow → Anima/Animus → Self → Integration). Progress persists across sessions.
- **Sessions** — Full multi-turn conversations with Jung. Sessions auto-save and can be resumed at any time.

---

## Roadmap

- [ ] Dream journal with Jungian symbol dictionary
- [ ] RAG system over Jung's Collected Works (21 volumes)
- [ ] Voice synthesis (ElevenLabs + archival 1951/57 Jung recordings)
- [ ] Mandala creation tool for Active Imagination
- [ ] Art Institute of Chicago / Rijksmuseum APIs for infinite paintings
- [ ] Export journal as PDF
