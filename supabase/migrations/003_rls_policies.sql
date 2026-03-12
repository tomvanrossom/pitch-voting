-- Enable Row Level Security and create policies

-- Enable RLS on both tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballots ENABLE ROW LEVEL SECURITY;

-- Sessions: Anyone can read (to join by code)
CREATE POLICY "sessions_select" ON sessions
  FOR SELECT USING (true);

-- Sessions: Anyone can create
CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT WITH CHECK (true);

-- Sessions: Only host can update (via x-host-token header)
CREATE POLICY "sessions_update_host_only" ON sessions
  FOR UPDATE USING (
    host_token = COALESCE(
      (current_setting('request.headers', true)::json->>'x-host-token')::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid
    )
  );

-- Ballots: Host can read ballots for their session
CREATE POLICY "ballots_select_for_host" ON ballots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = ballots.session_id
      AND s.host_token = COALESCE(
        (current_setting('request.headers', true)::json->>'x-host-token')::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid
      )
    )
  );

-- Ballots: Anyone can insert (uniqueness constraint prevents duplicates)
CREATE POLICY "ballots_insert" ON ballots
  FOR INSERT WITH CHECK (true);
