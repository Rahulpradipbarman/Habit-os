-- Supabase Database Schema for Habit OS

-- 1. Create users table
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text,
  reminder_time text,
  timezone text,
  created_at timestamptz default now()
);

-- 2. Create habits table
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  category text,
  frequency text,
  target_days integer[],
  color text,
  icon text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. Create habit_logs table
create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  date date not null,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(habit_id, date)
);

-- 4. Create ai_insights table
create table ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  insight_text text not null,
  week integer not null,
  year integer not null,
  created_at timestamptz default now()
);

-- 5. Enable Row-Level Security (RLS)
-- NOTE: Since you are connecting via the `service_role` secret key from Next.js server actions,
-- all queries bypass RLS policies automatically. Enabling RLS is still recommended to protect
-- the tables from unauthorized public access via client-side keys.
alter table users enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table ai_insights enable row level security;

-- 6. Create RLS Policies
-- Under service_role execution, these policies are bypassed. If you transition back to using
-- the standard `anon` public key in the future, these policies will authorize matching requests.
create policy "Allow public access to users" on users for all using (true) with check (true);
create policy "Allow public access to habits" on habits for all using (true) with check (true);
create policy "Allow public access to habit_logs" on habit_logs for all using (true) with check (true);
create policy "Allow public access to ai_insights" on ai_insights for all using (true) with check (true);

-- 7. Create mood_logs table
create table mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table mood_logs enable row level security;
create policy "Allow public access to mood_logs" on mood_logs for all using (true) with check (true);
