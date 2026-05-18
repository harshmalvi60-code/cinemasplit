-- Run this in the Supabase SQL Editor to set up CinemaSplit tables

-- Leads table: captures emails from the auth popup
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site events table: custom event tracking
CREATE TABLE IF NOT EXISTS site_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for leads: anyone can insert, only service role can read
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Service role read leads" ON leads FOR SELECT USING (auth.role() = 'service_role');

-- RLS for site_events: anyone can insert, only service role can read
ALTER TABLE site_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert events" ON site_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Service role read events" ON site_events FOR SELECT USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS site_events_type_idx ON site_events(event_type);
CREATE INDEX IF NOT EXISTS site_events_created_idx ON site_events(created_at DESC);
