# Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace localStorage with Supabase to enable multi-device voting with host-controlled sessions.

**Architecture:** Client-side React SPA communicates with Supabase via JS SDK. Host creates sessions, voters join via 6-char code. Host receives real-time ballot updates; voters poll. RLS enforces authorization without backend.

**Tech Stack:** React 19, Supabase JS SDK, Vitest, PostgreSQL (Supabase-hosted)

**Spec:** `docs/superpowers/specs/2026-03-12-supabase-migration-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|----------------|
| `src/lib/supabase.js` | Supabase client singleton |
| `src/services/sessionService.js` | Session CRUD operations |
| `src/services/sessionService.test.js` | Service unit tests |
| `src/services/ballotService.js` | Ballot submission operations |
| `src/services/ballotService.test.js` | Service unit tests |
| `src/hooks/useRealtimeBallots.js` | Host real-time subscription hook |
| `src/hooks/useRealtimeBallots.test.js` | Hook tests |
| `src/pages/CreateSession/CreateSession.jsx` | Host creates session UI |
| `src/pages/CreateSession/index.js` | Page export |
| `src/pages/JoinSession/JoinSession.jsx` | Voter joins session UI |
| `src/pages/JoinSession/index.js` | Page export |
| `src/pages/Lobby/Lobby.jsx` | Waiting room for voters |
| `src/pages/Lobby/index.js` | Page export |
| `src/pages/HostDashboard/HostDashboard.jsx` | Host controls during voting |
| `src/pages/HostDashboard/index.js` | Page export |
| `src/utils/supabaseHelpers.js` | Helper for authenticated requests |
| `supabase/migrations/001_create_sessions.sql` | Sessions table DDL |
| `supabase/migrations/002_create_ballots.sql` | Ballots table DDL |
| `supabase/migrations/003_rls_policies.sql` | Row-level security |
| `.env.example` | Environment variable template |

### Modified Files

| File | Changes |
|------|---------|
| `src/context/votingContext.jsx` | Add Supabase integration, host/voter modes |
| `src/pages/App.jsx` | Add new routes, role-based routing |
| `src/pages/Setup/Setup.jsx` | Adapt for host flow |
| `src/pages/Voting/Voting.jsx` | Adapt for voter flow |
| `package.json` | Add @supabase/supabase-js |

---

## Chunk 1: Foundation

### Task 1: Install Supabase SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependency**

Run: `npm install @supabase/supabase-js`

- [ ] **Step 2: Verify installation**

Run: `npm ls @supabase/supabase-js`
Expected: `@supabase/supabase-js@2.x.x`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @supabase/supabase-js dependency"
```

---

### Task 2: Create Environment Configuration

**Files:**
- Create: `.env.example`
- Create: `.env.local` (not committed)

- [ ] **Step 1: Create .env.example template**

```bash
# .env.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 2: Create local .env.local with real values**

Copy `.env.example` to `.env.local` and fill in your Supabase project credentials.

- [ ] **Step 3: Verify .env.local is gitignored**

Run: `grep -q ".env.local" .gitignore && echo "OK" || echo "MISSING"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "chore: add environment variable template for Supabase"
```

---

### Task 3: Create Supabase Client

**Files:**
- Create: `src/lib/supabase.js`

- [ ] **Step 1: Write Supabase client module**

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Verify module loads without error**

Run: `npm run dev`
Expected: App starts without "Missing Supabase environment variables" error (assuming .env.local is configured)

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.js
git commit -m "feat: add Supabase client singleton"
```

---

## Chunk 2: Database Schema

### Task 4: Create Sessions Table Migration

**Files:**
- Create: `supabase/migrations/001_create_sessions.sql`

- [ ] **Step 1: Write sessions table DDL**

```sql
-- supabase/migrations/001_create_sessions.sql

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
```

- [ ] **Step 2: Apply migration in Supabase dashboard**

Go to Supabase Dashboard > SQL Editor > Run the migration script.

- [ ] **Step 3: Verify table exists**

Run in SQL Editor: `SELECT * FROM sessions LIMIT 1;`
Expected: Empty result set (no error)

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/001_create_sessions.sql
git commit -m "feat: add sessions table migration"
```

---

### Task 5: Create Ballots Table Migration

**Files:**
- Create: `supabase/migrations/002_create_ballots.sql`

- [ ] **Step 1: Write ballots table DDL**

```sql
-- supabase/migrations/002_create_ballots.sql

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
```

- [ ] **Step 2: Apply migration in Supabase dashboard**

Go to Supabase Dashboard > SQL Editor > Run the migration script.

- [ ] **Step 3: Verify table exists**

Run in SQL Editor: `SELECT * FROM ballots LIMIT 1;`
Expected: Empty result set (no error)

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/002_create_ballots.sql
git commit -m "feat: add ballots table migration"
```

---

### Task 6: Create RLS Policies

**Files:**
- Create: `supabase/migrations/003_rls_policies.sql`

- [ ] **Step 1: Write RLS policies**

```sql
-- supabase/migrations/003_rls_policies.sql

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
```

- [ ] **Step 2: Apply migration in Supabase dashboard**

Go to Supabase Dashboard > SQL Editor > Run the migration script.

- [ ] **Step 3: Verify RLS is enabled**

Run in SQL Editor:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('sessions', 'ballots');
```
Expected: Both rows show `rowsecurity = true`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/003_rls_policies.sql
git commit -m "feat: add row-level security policies"
```

---

## Chunk 3: Session Service

### Task 7: Create Session Service - Code Generator

**Files:**
- Create: `src/services/sessionService.js`
- Create: `src/services/sessionService.test.js`

- [ ] **Step 1: Write failing test for generateSessionCode**

```javascript
// src/services/sessionService.test.js
import { describe, it, expect } from 'vitest'
import { generateSessionCode } from './sessionService'

describe('generateSessionCode', () => {
  it('returns a 6-character alphanumeric string', () => {
    const code = generateSessionCode()

    expect(code).toHaveLength(6)
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('generates different codes on subsequent calls', () => {
    const codes = new Set()
    for (let i = 0; i < 100; i++) {
      codes.add(generateSessionCode())
    }
    expect(codes.size).toBeGreaterThan(90)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/sessionService.test.js`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```javascript
// src/services/sessionService.js

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous: 0,O,1,I

export function generateSessionCode() {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/services/sessionService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/sessionService.js src/services/sessionService.test.js
git commit -m "feat: add session code generator"
```

---

### Task 8: Create Session Service - Create Session

**Files:**
- Modify: `src/services/sessionService.js`
- Modify: `src/services/sessionService.test.js`

- [ ] **Step 1: Write failing test for createSession**

```javascript
// Add to src/services/sessionService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSessionCode, createSession } from './sessionService'

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

describe('createSession', () => {
  it('creates a session with voters and candidates', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockSession = {
      id: 'uuid-123',
      code: 'ABC123',
      host_token: 'host-uuid',
      voters: ['Alice', 'Bob'],
      candidates: ['Option1', 'Option2']
    }

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
        })
      })
    })

    const result = await createSession(['Alice', 'Bob'], ['Option1', 'Option2'])

    expect(result.session).toEqual(mockSession)
    expect(result.hostToken).toBe('host-uuid')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/sessionService.test.js`
Expected: FAIL - createSession not defined

- [ ] **Step 3: Write minimal implementation**

```javascript
// Add to src/services/sessionService.js
import { supabase } from '../lib/supabase'

export async function createSession(voters, candidates) {
  const code = generateSessionCode()

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      code,
      voters,
      candidates,
      stage: 'setup'
    })
    .select()
    .single()

  if (error) {
    // Retry with new code if collision
    if (error.code === '23505') {
      return createSession(voters, candidates)
    }
    throw error
  }

  return {
    session: data,
    hostToken: data.host_token
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/services/sessionService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/sessionService.js src/services/sessionService.test.js
git commit -m "feat: add createSession function"
```

---

### Task 9: Create Session Service - Join Session

**Files:**
- Modify: `src/services/sessionService.js`
- Modify: `src/services/sessionService.test.js`

- [ ] **Step 1: Write failing test for joinSession**

```javascript
// Add to src/services/sessionService.test.js
describe('joinSession', () => {
  it('fetches session by code', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockSession = {
      id: 'uuid-123',
      code: 'ABC123',
      voters: ['Alice', 'Bob'],
      candidates: ['Option1', 'Option2'],
      stage: 'setup'
    }

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
        })
      })
    })

    const result = await joinSession('ABC123')

    expect(result).toEqual(mockSession)
    expect(result.host_token).toBeUndefined() // Should not expose host token
  })

  it('throws error for invalid code', async () => {
    const { supabase } = await import('../lib/supabase')

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
        })
      })
    })

    await expect(joinSession('INVALID')).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/sessionService.test.js`
Expected: FAIL - joinSession not defined

- [ ] **Step 3: Write minimal implementation**

```javascript
// Add to src/services/sessionService.js
export async function joinSession(code) {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, code, voters, candidates, stage, round, current_voter, eliminated, score_history, winner')
    .eq('code', code.toUpperCase())
    .single()

  if (error) {
    throw new Error('Session not found')
  }

  return data
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/services/sessionService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/sessionService.js src/services/sessionService.test.js
git commit -m "feat: add joinSession function"
```

---

### Task 9b: Create Session Service - Get Session By ID

**Files:**
- Modify: `src/services/sessionService.js`
- Modify: `src/services/sessionService.test.js`

- [ ] **Step 1: Write failing test for getSessionById**

```javascript
// Add to src/services/sessionService.test.js
describe('getSessionById', () => {
  it('fetches session by id', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockSession = {
      id: 'uuid-123',
      code: 'ABC123',
      voters: ['Alice', 'Bob'],
      stage: 'voting'
    }

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
        })
      })
    })

    const result = await getSessionById('uuid-123')

    expect(result.id).toBe('uuid-123')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/sessionService.test.js`
Expected: FAIL - getSessionById not defined

- [ ] **Step 3: Write minimal implementation**

```javascript
// Add to src/services/sessionService.js
export async function getSessionById(sessionId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, code, voters, candidates, stage, round, current_voter, eliminated, score_history, winner')
    .eq('id', sessionId)
    .single()

  if (error) {
    throw new Error('Session not found')
  }

  return data
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/services/sessionService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/sessionService.js src/services/sessionService.test.js
git commit -m "feat: add getSessionById function"
```

---

### Task 10: Create Session Service - Update Session (Host Only)

**Files:**
- Modify: `src/services/sessionService.js`
- Modify: `src/services/sessionService.test.js`

- [ ] **Step 1: Write failing test for updateSession**

```javascript
// Add to src/services/sessionService.test.js
describe('updateSession', () => {
  it('updates session with host token header', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockUpdated = { id: 'uuid-123', stage: 'voting' }

    supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null })
          })
        })
      })
    })

    const result = await updateSession('uuid-123', { stage: 'voting' }, 'host-token-uuid')

    expect(result.stage).toBe('voting')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/sessionService.test.js`
Expected: FAIL - updateSession not defined

- [ ] **Step 3: Create Supabase helper for authenticated requests**

```javascript
// src/utils/supabaseHelpers.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function createHostClient(hostToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { 'x-host-token': hostToken }
    }
  })
}
```

- [ ] **Step 4: Write minimal implementation**

```javascript
// Add to src/services/sessionService.js
import { createHostClient } from '../utils/supabaseHelpers'

export async function updateSession(sessionId, updates, hostToken) {
  const client = createHostClient(hostToken)

  const { data, error } = await client
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update session: ' + error.message)
  }

  return data
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/services/sessionService.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/supabaseHelpers.js src/services/sessionService.js src/services/sessionService.test.js
git commit -m "feat: add updateSession function with host auth"
```

---

## Chunk 4: Ballot Service

### Task 11: Create Ballot Service - Submit Ballot

**Files:**
- Create: `src/services/ballotService.js`
- Create: `src/services/ballotService.test.js`

- [ ] **Step 1: Write failing test for submitBallot**

```javascript
// src/services/ballotService.test.js
import { describe, it, expect, vi } from 'vitest'
import { submitBallot } from './ballotService'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

describe('submitBallot', () => {
  it('submits a ballot for a voter', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockBallot = {
      id: 'ballot-uuid',
      session_id: 'session-uuid',
      round: 1,
      voter_name: 'Alice',
      rankings: ['Option1', 'Option2']
    }

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockBallot, error: null })
        })
      })
    })

    const result = await submitBallot('session-uuid', 1, 'Alice', ['Option1', 'Option2'])

    expect(result).toEqual(mockBallot)
  })

  it('throws error on duplicate submission', async () => {
    const { supabase } = await import('../lib/supabase')

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate' }
          })
        })
      })
    })

    await expect(
      submitBallot('session-uuid', 1, 'Alice', ['Option1'])
    ).rejects.toThrow('already submitted')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/ballotService.test.js`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```javascript
// src/services/ballotService.js
import { supabase } from '../lib/supabase'

export async function submitBallot(sessionId, round, voterName, rankings) {
  const { data, error } = await supabase
    .from('ballots')
    .insert({
      session_id: sessionId,
      round,
      voter_name: voterName,
      rankings
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already submitted a ballot for this round')
    }
    throw error
  }

  return data
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/services/ballotService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/ballotService.js src/services/ballotService.test.js
git commit -m "feat: add submitBallot function"
```

---

### Task 12: Create Ballot Service - Get Round Ballots (Host)

**Files:**
- Modify: `src/services/ballotService.js`
- Modify: `src/services/ballotService.test.js`

- [ ] **Step 1: Write failing test for getRoundBallots**

```javascript
// Add to src/services/ballotService.test.js
describe('getRoundBallots', () => {
  it('fetches all ballots for a round with host token', async () => {
    const { supabase } = await import('../lib/supabase')

    const mockBallots = [
      { voter_name: 'Alice', rankings: ['A', 'B'] },
      { voter_name: 'Bob', rankings: ['B', 'A'] }
    ]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockBallots, error: null })
        })
      })
    })

    const result = await getRoundBallots('session-uuid', 1, 'host-token')

    expect(result).toHaveLength(2)
    expect(result[0].voter_name).toBe('Alice')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/services/ballotService.test.js`
Expected: FAIL - getRoundBallots not defined

- [ ] **Step 3: Write minimal implementation**

```javascript
// Add to src/services/ballotService.js
import { createHostClient } from '../utils/supabaseHelpers'

export async function getRoundBallots(sessionId, round, hostToken) {
  const client = createHostClient(hostToken)

  const { data, error } = await client
    .from('ballots')
    .select('voter_name, rankings')
    .eq('session_id', sessionId)
    .eq('round', round)

  if (error) {
    throw error
  }

  return data
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/services/ballotService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/ballotService.js src/services/ballotService.test.js
git commit -m "feat: add getRoundBallots function for host"
```

---

## Chunk 5: Real-time Hook

### Task 13: Create useRealtimeBallots Hook

**Files:**
- Create: `src/hooks/useRealtimeBallots.js`
- Create: `src/hooks/useRealtimeBallots.test.js`

- [ ] **Step 1: Write failing test for useRealtimeBallots**

```javascript
// src/hooks/useRealtimeBallots.test.js
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRealtimeBallots } from './useRealtimeBallots'

vi.mock('../lib/supabase', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn()
  }
  return {
    supabase: {
      channel: vi.fn(() => mockChannel),
      removeChannel: vi.fn()
    }
  }
})

describe('useRealtimeBallots', () => {
  it('returns ballot count starting at 0', () => {
    const { result } = renderHook(() =>
      useRealtimeBallots('session-123', true)
    )

    expect(result.current.ballotCount).toBe(0)
  })

  it('does not subscribe when not enabled', () => {
    const { supabase } = vi.mocked(await import('../lib/supabase'))

    renderHook(() => useRealtimeBallots('session-123', false))

    expect(supabase.channel).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/hooks/useRealtimeBallots.test.js`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```javascript
// src/hooks/useRealtimeBallots.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeBallots(sessionId, enabled = true) {
  const [ballotCount, setBallotCount] = useState(0)
  const [votersSubmitted, setVotersSubmitted] = useState([])

  useEffect(() => {
    if (!enabled || !sessionId) return

    const channel = supabase
      .channel(`ballots:${sessionId}`)
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
          setVotersSubmitted(prev => [...prev, payload.new.voter_name])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, enabled])

  const reset = () => {
    setBallotCount(0)
    setVotersSubmitted([])
  }

  return { ballotCount, votersSubmitted, reset }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/hooks/useRealtimeBallots.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useRealtimeBallots.js src/hooks/useRealtimeBallots.test.js
git commit -m "feat: add useRealtimeBallots hook for host"
```

---

## Chunk 6: UI Pages

### Task 14: Create CreateSession Page

**Files:**
- Create: `src/pages/CreateSession/CreateSession.jsx`
- Create: `src/pages/CreateSession/index.js`

- [ ] **Step 1: Create page component**

```javascript
// src/pages/CreateSession/CreateSession.jsx
import React, { useState } from 'react'
import { Box, TextField, Button, Typography, Stack } from '@mui/material'
import { createSession } from '../../services/sessionService'
import { Card } from '../../components/molecules/Card/Card'

export function CreateSession({ onSessionCreated }) {
  const [voters, setVoters] = useState('')
  const [candidates, setCandidates] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const voterList = voters.split(',').map(v => v.trim()).filter(Boolean)
      const candidateList = candidates.split(',').map(c => c.trim()).filter(Boolean)

      if (voterList.length < 2) {
        throw new Error('At least 2 voters required')
      }
      if (candidateList.length < 2) {
        throw new Error('At least 2 candidates required')
      }

      const { session, hostToken } = await createSession(voterList, candidateList)

      // Store host token locally
      localStorage.setItem(`host_${session.id}`, hostToken)

      onSessionCreated(session, hostToken)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Typography variant="h5" gutterBottom>Create Voting Session</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Voters (comma-separated)"
            value={voters}
            onChange={(e) => setVoters(e.target.value)}
            placeholder="Alice, Bob, Charlie"
            fullWidth
            required
          />
          <TextField
            label="Candidates (comma-separated)"
            value={candidates}
            onChange={(e) => setCandidates(e.target.value)}
            placeholder="Option A, Option B, Option C"
            fullWidth
            required
          />
          {error && (
            <Typography color="error">{error}</Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Creating...' : 'Create Session'}
          </Button>
        </Stack>
      </form>
    </Card>
  )
}
```

- [ ] **Step 2: Create index export**

```javascript
// src/pages/CreateSession/index.js
export { CreateSession } from './CreateSession'
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/CreateSession/
git commit -m "feat: add CreateSession page"
```

---

### Task 15: Create JoinSession Page

**Files:**
- Create: `src/pages/JoinSession/JoinSession.jsx`
- Create: `src/pages/JoinSession/index.js`

- [ ] **Step 1: Create page component**

```javascript
// src/pages/JoinSession/JoinSession.jsx
import React, { useState } from 'react'
import { Box, TextField, Button, Typography, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { joinSession } from '../../services/sessionService'
import { Card } from '../../components/molecules/Card/Card'

export function JoinSession({ onSessionJoined }) {
  const [code, setCode] = useState('')
  const [session, setSession] = useState(null)
  const [selectedVoter, setSelectedVoter] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLookup = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const found = await joinSession(code)
      setSession(found)
    } catch (err) {
      setError('Session not found. Check your code.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = () => {
    if (!selectedVoter) return

    // Store voter info locally
    localStorage.setItem('voter_session', JSON.stringify({
      sessionId: session.id,
      voterName: selectedVoter
    }))

    onSessionJoined(session, selectedVoter)
  }

  if (session) {
    return (
      <Card>
        <Typography variant="h5" gutterBottom>Select Your Name</Typography>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Who are you?</InputLabel>
            <Select
              value={selectedVoter}
              label="Who are you?"
              onChange={(e) => setSelectedVoter(e.target.value)}
            >
              {session.voters.map(voter => (
                <MenuItem key={voter} value={voter}>{voter}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleJoin}
            disabled={!selectedVoter}
            fullWidth
          >
            Join Session
          </Button>
        </Stack>
      </Card>
    )
  }

  return (
    <Card>
      <Typography variant="h5" gutterBottom>Join Voting Session</Typography>
      <form onSubmit={handleLookup}>
        <Stack spacing={2}>
          <TextField
            label="Session Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            inputProps={{ maxLength: 6, style: { textTransform: 'uppercase' } }}
            fullWidth
            required
          />
          {error && (
            <Typography color="error">{error}</Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Looking up...' : 'Find Session'}
          </Button>
        </Stack>
      </form>
    </Card>
  )
}
```

- [ ] **Step 2: Create index export**

```javascript
// src/pages/JoinSession/index.js
export { JoinSession } from './JoinSession'
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/JoinSession/
git commit -m "feat: add JoinSession page"
```

---

### Task 16: Create HostDashboard Page

**Files:**
- Create: `src/pages/HostDashboard/HostDashboard.jsx`
- Create: `src/pages/HostDashboard/index.js`

- [ ] **Step 1: Create page component**

```javascript
// src/pages/HostDashboard/HostDashboard.jsx
import React from 'react'
import { Box, Typography, Stack, Button, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Card } from '../../components/molecules/Card/Card'
import { useRealtimeBallots } from '../../hooks/useRealtimeBallots'

export function HostDashboard({ session, hostToken, onReveal, onStartVoting }) {
  const isVoting = session.stage === 'voting'
  const { ballotCount, votersSubmitted } = useRealtimeBallots(
    session.id,
    isVoting
  )

  const allVotesIn = ballotCount >= session.voters.length

  return (
    <Card>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5">Host Dashboard</Typography>
          <Typography color="text.secondary">
            Share code: <Chip label={session.code} color="primary" />
          </Typography>
        </Box>

        {session.stage === 'setup' && (
          <Button
            variant="contained"
            onClick={onStartVoting}
            fullWidth
          >
            Start Voting (Round {session.round})
          </Button>
        )}

        {isVoting && (
          <>
            <Typography variant="h6">
              Round {session.round} - Waiting for votes
            </Typography>
            <List>
              {session.voters.map(voter => {
                const hasVoted = votersSubmitted.includes(voter)
                return (
                  <ListItem key={voter}>
                    <ListItemIcon>
                      {hasVoted ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <RadioButtonUncheckedIcon color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={voter} />
                  </ListItem>
                )
              })}
            </List>
            <Typography>
              {ballotCount}/{session.voters.length} votes received
            </Typography>
            <Button
              variant="contained"
              onClick={onReveal}
              disabled={!allVotesIn}
              fullWidth
            >
              {allVotesIn ? 'Reveal Result' : 'Waiting for all votes...'}
            </Button>
          </>
        )}
      </Stack>
    </Card>
  )
}
```

- [ ] **Step 2: Create index export**

```javascript
// src/pages/HostDashboard/index.js
export { HostDashboard } from './HostDashboard'
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/HostDashboard/
git commit -m "feat: add HostDashboard page with real-time ballot tracking"
```

---

### Task 17: Create Lobby Page (Voter Waiting)

**Files:**
- Create: `src/pages/Lobby/Lobby.jsx`
- Create: `src/pages/Lobby/index.js`

- [ ] **Step 1: Create page component**

```javascript
// src/pages/Lobby/Lobby.jsx
import React, { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, Stack } from '@mui/material'
import { Card } from '../../components/molecules/Card/Card'
import { getSessionById } from '../../services/sessionService'

export function Lobby({ sessionId, voterName, onSessionStart }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    const pollSession = async () => {
      try {
        const data = await getSessionById(sessionId)
        setSession(data)

        if (data.stage === 'voting') {
          onSessionStart(data)
        }
      } catch (err) {
        console.error('Failed to poll session:', err)
      }
    }

    pollSession()
    const interval = setInterval(pollSession, 3000)

    return () => clearInterval(interval)
  }, [sessionId, onSessionStart])

  return (
    <Card>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h5">Welcome, {voterName}!</Typography>
        <CircularProgress />
        <Typography color="text.secondary">
          Waiting for host to start voting...
        </Typography>
        {session && (
          <Typography variant="body2">
            {session.voters.length} voters, {session.candidates.length} candidates
          </Typography>
        )}
      </Stack>
    </Card>
  )
}
```

- [ ] **Step 2: Create index export**

```javascript
// src/pages/Lobby/index.js
export { Lobby } from './Lobby'
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Lobby/
git commit -m "feat: add Lobby page for voter waiting"
```

---

## Chunk 7: Integration

### Task 18: Update App.jsx with New Routes

**Files:**
- Modify: `src/pages/App.jsx`

- [ ] **Step 1: Read current App.jsx**

Review the current routing/stage logic.

- [ ] **Step 2: Update App.jsx to support host/voter flows**

Add a top-level mode selection (host vs voter) and integrate new pages. The specific implementation depends on current App structure, but should:

- Add "Create Session" / "Join Session" choice at entry
- Route hosts to HostDashboard during voting
- Route voters to Lobby then Voting page
- Preserve existing Announce/Eliminated/Winner pages

- [ ] **Step 3: Test manually**

Run: `npm run dev`
Verify:
- Can create a session as host
- Can join a session with code
- Host sees real-time ballot updates
- Voters can submit ballots

- [ ] **Step 4: Commit**

```bash
git add src/pages/App.jsx
git commit -m "feat: integrate Supabase flow into App routing"
```

---

### Task 19: Update Voting Page for Supabase

**Files:**
- Modify: `src/pages/Voting/Voting.jsx`

- [ ] **Step 1: Update to use ballotService**

Replace direct state updates with `submitBallot()` call.

- [ ] **Step 2: Add voter confirmation after submit**

Show "Vote submitted! Waiting for others..." after successful submission.

- [ ] **Step 3: Test ballot submission**

Verify ballot appears in Supabase dashboard after submission.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Voting/Voting.jsx
git commit -m "feat: update Voting page to submit ballots to Supabase"
```

---

### Task 20: Update VotingContext for Supabase Integration

**Files:**
- Modify: `src/context/votingContext.jsx`

- [ ] **Step 1: Add session and role state**

```javascript
// Add to state
sessionId: null,
hostToken: null,  // null = voter mode
voterName: null,
```

- [ ] **Step 2: Add actions for Supabase operations**

```javascript
case "SET_SESSION":
  return { ...state, sessionId: action.payload.id, ...action.payload }

case "SET_HOST":
  return { ...state, hostToken: action.payload }

case "SET_VOTER":
  return { ...state, voterName: action.payload }
```

- [ ] **Step 3: Update REVEAL_RESULT to fetch ballots from Supabase**

Host fetches ballots via `getRoundBallots()`, calculates loser, updates session.

- [ ] **Step 4: Test full flow**

Run through complete voting session with multiple browser tabs.

- [ ] **Step 5: Commit**

```bash
git add src/context/votingContext.jsx
git commit -m "feat: integrate Supabase into VotingContext"
```

---

## Chunk 8: Cleanup

### Task 21: Remove Old localStorage Logic

**Files:**
- Modify: `src/context/votingContext.jsx`

- [ ] **Step 1: Remove state persistence to localStorage**

Delete `saveStateToStorage()` calls and auto-save effect.

- [ ] **Step 2: Keep localStorage only for host_token and voter_session**

These local-only values should remain.

- [ ] **Step 3: Update initializeState**

Remove `loadStateFromStorage()`, start fresh each time.

- [ ] **Step 4: Test that refresh requires rejoining**

Voters should need to re-enter code after refresh (or restore from localStorage voter_session).

- [ ] **Step 5: Commit**

```bash
git add src/context/votingContext.jsx
git commit -m "refactor: remove full-state localStorage, keep only auth tokens"
```

---

### Task 22: Add TTL Cron Job

**Files:**
- Create: `supabase/migrations/004_ttl_cron.sql`

- [ ] **Step 1: Write cron job migration**

```sql
-- supabase/migrations/004_ttl_cron.sql
-- Note: pg_cron must be enabled in Supabase dashboard first

SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 3 * * *',
  $$DELETE FROM sessions WHERE expires_at < NOW();$$
);
```

- [ ] **Step 2: Enable pg_cron in Supabase dashboard**

Go to Database > Extensions > Enable pg_cron

- [ ] **Step 3: Apply migration**

Run in SQL Editor.

- [ ] **Step 4: Verify cron job exists**

```sql
SELECT * FROM cron.job;
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/004_ttl_cron.sql
git commit -m "feat: add TTL cleanup cron job for expired sessions"
```

---

### Task 23: Final Integration Test

- [ ] **Step 1: Test complete flow**

1. Open browser tab 1 as host - create session
2. Open browser tab 2 as voter - join with code
3. Open browser tab 3 as another voter - join with code
4. Host starts voting
5. Both voters submit ballots
6. Host sees real-time count update
7. Host reveals result
8. Verify eliminated candidate shown
9. Continue through all rounds to winner

- [ ] **Step 2: Test edge cases**

- Duplicate ballot submission (should fail)
- Invalid session code (should show error)
- Refresh as voter (should restore from localStorage)

- [ ] **Step 3: Commit final state**

```bash
git add -A
git commit -m "feat: complete Supabase migration - multi-device voting ready"
```

---

## Success Criteria

- [ ] Host can create session with custom voters/candidates
- [ ] Voters can join via 6-character code
- [ ] Each voter can submit one ballot per round
- [ ] Host sees real-time ballot count
- [ ] Host controls reveal/advance actions
- [ ] Sessions auto-delete after 30 days
- [ ] Works across multiple devices/browsers simultaneously
- [ ] Still deployable to GitHub Pages
