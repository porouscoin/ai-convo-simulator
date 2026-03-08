-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- SCENARIOS
-- ─────────────────────────────────────────
create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,          -- e.g. 'career', 'sales', 'conflict', 'social'
  tags text[] default '{}',
  default_context text,            -- pre-filled context hint for the user
  default_goal text,               -- pre-filled goal hint for the user
  is_custom boolean default false, -- user-created scenarios
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Seed starter scenarios
insert into public.scenarios (title, description, category, tags, default_context, default_goal) values
  ('Salary Negotiation', 'Ask your manager for a raise and justify your request.', 'career', array['negotiation','salary','manager'], 'I have been in this role for 2 years and consistently exceeded my targets.', 'Get a 20% salary increase approved.'),
  ('Job Interview', 'Ace a job interview with a hiring manager at your target company.', 'career', array['interview','hiring','career'], 'I am applying for a senior software engineer role.', 'Convince the interviewer I am the best candidate.'),
  ('Sales Call', 'Pitch your product to a skeptical potential client.', 'sales', array['sales','pitch','client'], 'I am selling a SaaS tool to a prospect who is happy with their current solution.', 'Book a follow-up demo and advance the deal.'),
  ('Ask for Promotion', 'Make the case for a promotion to a more senior role.', 'career', array['promotion','career','manager'], 'I have led several successful projects and am ready for the next level.', 'Get my manager to commit to a promotion timeline.'),
  ('Difficult Coworker Conflict', 'Resolve an ongoing conflict with a coworker affecting team performance.', 'conflict', array['conflict','coworker','team'], 'My coworker consistently misses deadlines and blames others.', 'Reach a clear agreement on how we will work together going forward.'),
  ('Handling a Difficult Customer', 'De-escalate an angry customer who is demanding a refund.', 'sales', array['customer-service','conflict','sales'], 'The customer is furious about a delayed shipment and threatening to leave.', 'Retain the customer and resolve the complaint professionally.');

-- ─────────────────────────────────────────
-- SESSIONS
-- ─────────────────────────────────────────
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id) on delete restrict,
  personality_type text not null,   -- MBTI code e.g. 'INTJ'
  difficulty text not null,         -- 'easy' | 'medium' | 'hard'
  context text not null,            -- user-provided context
  user_goal text not null,          -- what the user wants to achieve
  status text not null default 'active',  -- 'active' | 'completed' | 'abandoned'
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- ─────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null,               -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- FEEDBACK
-- ─────────────────────────────────────────
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  overall_score integer,            -- 1-10
  strengths text[],
  weaknesses text[],
  key_moments text[],               -- specific moments highlighted in feedback
  better_responses jsonb,           -- [{original: "...", suggested: "...", reason: "..."}]
  personality_insight text,         -- MBTI-specific advice
  full_analysis text,               -- full paragraph analysis
  scores jsonb,                     -- {clarity: 7, persuasion: 6, emotional_control: 8, adaptability: 5}
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

alter table public.scenarios enable row level security;
alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.feedback enable row level security;

-- Scenarios: anyone can read built-in ones; users can read their own custom ones
create policy "Public scenarios are viewable by all authenticated users"
  on public.scenarios for select to authenticated
  using (is_custom = false or created_by = auth.uid());

create policy "Users can create custom scenarios"
  on public.scenarios for insert to authenticated
  with check (is_custom = true and created_by = auth.uid());

-- Sessions: users own their sessions
create policy "Users can view their own sessions"
  on public.sessions for select to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own sessions"
  on public.sessions for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own sessions"
  on public.sessions for update to authenticated
  using (user_id = auth.uid());

-- Messages: accessible via session ownership
create policy "Users can view messages in their sessions"
  on public.messages for select to authenticated
  using (session_id in (select id from public.sessions where user_id = auth.uid()));

create policy "Users can insert messages in their sessions"
  on public.messages for insert to authenticated
  with check (session_id in (select id from public.sessions where user_id = auth.uid()));

-- Feedback: users own their feedback
create policy "Users can view their own feedback"
  on public.feedback for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own feedback"
  on public.feedback for insert to authenticated
  with check (user_id = auth.uid());

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
create index idx_sessions_user_id on public.sessions(user_id);
create index idx_messages_session_id on public.messages(session_id);
create index idx_feedback_session_id on public.feedback(session_id);
create index idx_feedback_user_id on public.feedback(user_id);
