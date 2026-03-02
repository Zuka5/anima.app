Anima.app — Full Next.js Platform Build Plan
Context
Build a production-ready Jungian depth psychology platform (Anima.app) from scratch in the existing /Documents/Anima.app/ directory (currently empty). Stack: Next.js 14 App Router, Clerk auth, Supabase DB, Anthropic SDK (Claude Jung AI), Tailwind CSS, deployed to Vercel.

Project Structure

/Documents/Anima.app/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx     # Clerk sign-in
│   │   └── sign-up/[[...sign-up]]/page.tsx     # Clerk sign-up
│   ├── (dashboard)/
│   │   ├── layout.tsx                          # Protected layout + nav
│   │   ├── page.tsx                            # Dashboard/home
│   │   ├── active-imagination/page.tsx
│   │   ├── archetypes/page.tsx
│   │   ├── individuation/page.tsx
│   │   └── sessions/page.tsx
│   ├── api/
│   │   ├── jung/route.ts                       # Claude AI endpoint (streaming)
│   │   ├── journal/route.ts                    # Journal CRUD
│   │   └── sessions/route.ts                   # Sessions CRUD
│   ├── layout.tsx                              # Root layout w/ ClerkProvider
│   └── page.tsx                               # Landing page
├── components/
│   ├── Navigation.tsx
│   ├── JungChat.tsx                           # Shared AI response component
│   └── JournalEditor.tsx
├── lib/
│   ├── supabase.ts                            # Browser Supabase client
│   ├── supabase-server.ts                     # Server Supabase w/ Clerk JWT
│   └── anthropic.ts                           # Anthropic client + Jung prompt
├── types/index.ts
├── middleware.ts                              # Clerk route protection
├── .env.local                                 # Env var template
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
Supabase Schema (3 tables)

-- Journal entries for all modules
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
CREATE POLICY "Users own entries" ON journal_entries USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

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
CREATE POLICY "Users own sessions" ON sessions USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Per-user individuation progress
CREATE TABLE individuation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  current_stage INTEGER DEFAULT 0,
  stage_notes JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE individuation_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own progress" ON individuation_progress USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
Implementation Steps
Step 1 — Scaffold Next.js project
Delete index.html
Run npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
Install dependencies: @clerk/nextjs @supabase/supabase-js @anthropic-ai/sdk
Step 2 — Environment & config
Create .env.local with placeholder keys for all services
Create .env.example for documentation
Configure next.config.ts (image domains for art APIs)
Step 3 — Clerk auth setup
middleware.ts — protect all (dashboard) routes, allow /, /sign-in, /sign-up
Root app/layout.tsx — wrap in <ClerkProvider>
Sign-in/sign-up pages using Clerk's <SignIn> and <SignUp> components, styled dark
Step 4 — Supabase lib
lib/supabase.ts — browser client
lib/supabase-server.ts — server client using Clerk's getToken({template: 'supabase'}) for RLS
Step 5 — Anthropic lib
lib/anthropic.ts — Anthropic client + full Jung system prompt
Jung prompt: analytical psychologist persona, CW references, Jungian vocabulary, never breaks character
Step 6 — API routes
api/jung/route.ts — POST, verify Clerk auth, call Claude with streaming, return SSE
api/journal/route.ts — GET (list entries), POST (create), DELETE
api/sessions/route.ts — GET (list), POST (create/update), DELETE
Step 7 — Pages
Landing (app/page.tsx) — atmospheric dark hero, tagline, sign-in CTA, redirect if authed
Dashboard ((dashboard)/page.tsx) — greeting, recent entries, quick-start cards
Active Imagination — rotating 6 paintings, journal textarea, Jung streaming response
Archetypes — 8 archetype cards, select one, reflection form, Jung response, save to DB
Individuation — 5-stage tracker (progress bar), per-stage journaling, persistent progress from DB
Sessions — sidebar list of saved sessions, multi-turn chat with Jung, auto-save
Step 8 — Components
Navigation.tsx — dark sidebar with avatar, user menu (Clerk), nav links with icons
JungChat.tsx — streaming message display with typewriter effect
JournalEditor.tsx — textarea with save/AI-respond buttons
Step 9 — Styling
Dark atmospheric color palette: near-black bg, deep gold/amber accents, serif typography
Tailwind custom config: stone, amber colors, Playfair Display font for headings
Step 10 — Vercel deploy config
Create vercel.json (optional, env var instructions)
Add README.md with setup instructions (env vars, Supabase schema SQL, Clerk JWT template)
Visual Design
Background: #0a0a0a (near black)
Primary accent: #b45309 (amber-700) → golds
Text: #e5e0d5 (warm off-white)
Cards: #111111 with 1px border #2a2a2a
Headings: Playfair Display (serif, evokes depth)
Body: Inter
Jung AI System Prompt (core)

You are Carl Gustav Jung, the analytical psychologist (1875-1961).
You speak from the perspective of your Collected Works — integrating
concepts of individuation, the unconscious, archetypes, the Shadow,
Anima/Animus, the Self, synchronicity, and the collective unconscious.
Your voice is measured, philosophical, and deeply personal. You draw
on symbols, dreams, myth, and alchemy as the language of the psyche.
You never give clinical diagnoses. You invite the questioner deeper
into their own psyche. You speak in first person as Jung.
Verification
npm run dev — app loads on localhost:3000
Landing page visible without auth; dashboard redirects to sign-in without auth
Sign up with email → dashboard loads
Active Imagination: submit reflection → Jung streams a response
Archetypes: select + reflect → response saved to Supabase journal_entries
Individuation: complete a stage → progress persists on refresh
Sessions: send a message → session auto-saves; reload → history intact
vercel deploy — production works with env vars set in Vercel dashboard