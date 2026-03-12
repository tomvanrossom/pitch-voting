-- Create sessions table for voting sessions

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_token UUID NOT NULL DEFAULT gen_random_uuid(),
  voters JSONB NOT NULL DEFAULT '[]'::jsonb,
  candidates JSONB NOT NULL DEFAULT '[]'::jsonb,
  stage VARCHAR(20) NOT NULL DEFAULT 'setup',
  round INT NOT NULL DEFAULT 1,
  current_voter INT NOT NULL DEFAULT 0,
  eliminated JSONB NOT NULL DEFAULT '[]'::jsonb,
  score_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  winner VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

-- Index for join code lookups
CREATE INDEX sessions_code_idx ON sessions(code);

-- Index for TTL cleanup
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);
