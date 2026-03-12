-- Create ballots table for voter submissions

CREATE TABLE ballots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  round INT NOT NULL,
  voter_name VARCHAR(100) NOT NULL,
  rankings JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate votes per voter per round
  UNIQUE(session_id, round, voter_name)
);

-- Index for session ballot lookups
CREATE INDEX ballots_session_round_idx ON ballots(session_id, round);
