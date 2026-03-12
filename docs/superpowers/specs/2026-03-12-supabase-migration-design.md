# Supabase Migration Design Spec

**Date:** 2026-03-12
**Status:** Approved
**Author:** Claude + Tom

## Overview

Replace localStorage persistence with Supabase to enable multi-device voting. One host controls the session, voters join via session code from any device.

## Goals

- **Multi-device sync**: Multiple people voting from different browsers simultaneously
- **Host-controlled flow**: Host creates session, advances rounds, reveals results
- **No authentication**: Voters join with session code, pick name from list
- **30-day retention**: Sessions auto-delete after 30 days

## Non-Goals

- User accounts / authentication
- Voter-to-voter real-time updates
- Permanent history storage
- Offline support

---

## Database Schema

### sessions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| code | VARCHAR(6) UNIQUE | Join code (e.g., "X7K2M9") |
| host_token | UUID | Secret for host-only actions |
| voters | JSONB | Array of voter names |
| candidates | JSONB | Array of candidate names |
| stage | VARCHAR(20) | setup/voting/announce/eliminated/winner |
| round | INT | Current round number |
| current_voter | INT | Index of expected voter (for display) |
| eliminated | JSONB | Array of eliminated candidates |
| score_history | JSONB | Array of score objects per round |
| winner | VARCHAR(100) | Null until final round |
| created_at | TIMESTAMPTZ | Creation timestamp |
| expires_at | TIMESTAMPTZ | Default: created_at + 30 days |

### ballots

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| session_id | UUID (FK) | References sessions.id, CASCADE delete |
| round | INT | Which round this ballot is for |
| voter_name | VARCHAR(100) | Who submitted |
| rankings | JSONB | Ordered array of candidates |
| created_at | TIMESTAMPTZ | Submission timestamp |

---

## Session Flow

### Host Creates Session

1. Host clicks "Create Session"
2. Frontend generates:
   - `code`: Random 6-char alphanumeric
   - `host_token`: UUID stored in host's localStorage
3. INSERT session with voters, candidates, stage="setup"
4. Host sees shareable code

### Voter Joins Session

1. Voter enters session code
2. SELECT session by code
3. Voter picks their name from voter list
4. Browser stores `{ session_id, voter_name }` in localStorage
5. Voter sees waiting screen

### Voting Round

1. Host clicks "Start Voting" (validated by host_token)
2. UPDATE session: stage='voting', round=N
3. Voters poll/refresh, see voting form when it's their turn
4. Each voter submits ballot (INSERT into ballots)
5. Host sees real-time ballot count via Supabase Realtime
6. When all ballots in, host clicks "Reveal"
7. Score calculation runs, session updated with results
8. Voters see result on next poll/refresh

---

## Real-time (Host Only)

Host subscribes to ballot insertions for their session:

```javascript
supabase
  .channel('ballots')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'ballots',
      filter: `session_id=eq.${sessionId}`
    },
    (payload) => {
      setBallotCount(prev => prev + 1)
    }
  )
  .subscribe()
```

Voters do not receive real-time updates. They poll every 3-5 seconds or refresh manually.

---

## Row-Level Security (RLS)

### Sessions Table

```sql
-- Anyone can read sessions (to join by code)
CREATE POLICY "sessions_select" ON sessions
  FOR SELECT USING (true);

-- Anyone can create a session
CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT WITH CHECK (true);

-- Only host can update (via x-host-token header)
CREATE POLICY "sessions_update_host_only" ON sessions
  FOR UPDATE USING (
    host_token = (current_setting('request.headers', true)::json->>'x-host-token')::uuid
  );
```

### Ballots Table

```sql
-- Host can read ballots for their session
CREATE POLICY "ballots_select_for_host" ON ballots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = ballots.session_id
      AND s.host_token = (current_setting('request.headers', true)::json->>'x-host-token')::uuid
    )
  );

-- Voters can insert (one ballot per voter per round)
CREATE POLICY "ballots_insert" ON ballots
  FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM ballots b
      WHERE b.session_id = ballots.session_id
      AND b.round = ballots.round
      AND b.voter_name = ballots.voter_name
    )
  );
```

---

## TTL Cleanup

Sessions expire 30 days after creation. Daily cron job cleans up:

```sql
-- Enable pg_cron in Supabase dashboard first

SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 3 * * *',
  $$DELETE FROM sessions WHERE expires_at < NOW();$$
);
```

Ballots cascade-delete with their session:

```sql
ALTER TABLE ballots
  ADD CONSTRAINT ballots_session_fk
  FOREIGN KEY (session_id) REFERENCES sessions(id)
  ON DELETE CASCADE;
```

Default expiry on session creation:

```sql
ALTER TABLE sessions
  ALTER COLUMN expires_at
  SET DEFAULT NOW() + INTERVAL '30 days';
```

---

## Frontend Changes Summary

| Current (localStorage) | New (Supabase) |
|------------------------|----------------|
| `saveStateToStorage()` | UPDATE session row |
| `loadStateFromStorage()` | SELECT session + ballots |
| `saveConfig()` | Part of session creation |
| Auto-save on state change | Explicit saves on user actions |
| Single user | Host + multiple voters |

### New UI Screens Needed

1. **Create Session** - Host enters voters/candidates, gets code
2. **Join Session** - Enter code, pick voter name
3. **Host Dashboard** - Real-time ballot count, Reveal button
4. **Voter Waiting** - "Waiting for host to start..."

### localStorage Still Used For

- `host_token` (host only)
- `session_id` + `voter_name` (voters)

---

## Open Questions

1. **Score calculation location**: Client-side (current) or Supabase Edge Function?
   - Recommendation: Keep client-side for now, host calculates and writes result
2. **Session code collisions**: 6 chars = 2B combinations, check on insert or trust uniqueness?
   - Recommendation: UNIQUE constraint handles it, retry on conflict

---

## Success Criteria

- [ ] Host can create session with custom voters/candidates
- [ ] Voters can join via 6-character code
- [ ] Each voter can submit one ballot per round
- [ ] Host sees real-time ballot count
- [ ] Host controls reveal/advance actions
- [ ] Sessions auto-delete after 30 days
- [ ] Works across multiple devices/browsers simultaneously
