# Tap-to-Rank Ballot Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace dropdown-based BallotForm with a touch-friendly tap-to-rank interface.

**Architecture:** New `TapRankBallot` component with `CandidateChip` sub-component. Voters tap chips to assign ranks. Component maintains local ranking state and outputs same `rankings[]` format as current BallotForm.

**Tech Stack:** React, MUI, SCSS

**Spec:** `docs/superpowers/specs/2026-03-13-tap-rank-ballot-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/molecules/CandidateChip/CandidateChip.jsx` | Create | Single tappable candidate chip with rank badge |
| `src/components/molecules/CandidateChip/CandidateChip.scss` | Create | Chip styles (unranked, ranked, disabled states) |
| `src/components/molecules/CandidateChip/CandidateChip.test.jsx` | Create | Unit tests for chip states and interactions |
| `src/components/molecules/CandidateChip/index.js` | Create | Barrel export |
| `src/components/organisms/TapRankBallot/TapRankBallot.jsx` | Create | Main ballot component with ranking logic |
| `src/components/organisms/TapRankBallot/TapRankBallot.scss` | Create | Ballot layout styles |
| `src/components/organisms/TapRankBallot/TapRankBallot.test.jsx` | Create | Integration tests for ranking flow |
| `src/components/organisms/TapRankBallot/index.js` | Create | Barrel export |
| `src/pages/Voting/Voting.jsx` | Modify | Import TapRankBallot instead of BallotForm |

---

## Chunk 1: CandidateChip Component

### Task 1: Create CandidateChip with Tests

**Files:**
- Create: `src/components/molecules/CandidateChip/CandidateChip.jsx`
- Create: `src/components/molecules/CandidateChip/CandidateChip.test.jsx`
- Create: `src/components/molecules/CandidateChip/CandidateChip.scss`
- Create: `src/components/molecules/CandidateChip/index.js`

- [ ] **Step 1: Write the failing tests**

Create `src/components/molecules/CandidateChip/CandidateChip.test.jsx`:

```jsx
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CandidateChip } from './CandidateChip'

describe('CandidateChip', () => {
  test('renders candidate name', () => {
    render(<CandidateChip name="Malta" onTap={vi.fn()} />)
    expect(screen.getByText('Malta')).toBeInTheDocument()
  })

  test('shows rank badge when ranked', () => {
    render(<CandidateChip name="Malta" rank={1} onTap={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  test('does not show rank badge when unranked', () => {
    render(<CandidateChip name="Malta" onTap={vi.fn()} />)
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  test('calls onTap with candidate name when clicked', () => {
    const onTap = vi.fn()
    render(<CandidateChip name="Malta" onTap={onTap} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onTap).toHaveBeenCalledWith('Malta')
  })

  test('applies ranked class when rank is provided', () => {
    render(<CandidateChip name="Malta" rank={2} onTap={vi.fn()} />)
    const chip = screen.getByRole('button')
    expect(chip).toHaveClass('candidate-chip--ranked')
  })

  test('is disabled when disabled prop is true', () => {
    render(<CandidateChip name="Malta" disabled onTap={vi.fn()} />)
    const chip = screen.getByRole('button')
    expect(chip).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/molecules/CandidateChip/CandidateChip.test.jsx`
Expected: FAIL with "Cannot find module './CandidateChip'"

- [ ] **Step 3: Write the implementation**

Create `src/components/molecules/CandidateChip/CandidateChip.jsx`:

```jsx
import './CandidateChip.scss'

export function CandidateChip({ name, rank, onTap, disabled = false }) {
  const isRanked = rank !== undefined && rank !== null

  return (
    <button
      type="button"
      className={`candidate-chip ${isRanked ? 'candidate-chip--ranked' : ''}`}
      onClick={() => onTap(name)}
      disabled={disabled}
      aria-label={isRanked ? `${name}, ranked ${rank}` : `${name}, not ranked`}
    >
      {isRanked && <span className="candidate-chip__badge">{rank}</span>}
      <span className="candidate-chip__name">{name}</span>
    </button>
  )
}
```

- [ ] **Step 4: Create styles**

Create `src/components/molecules/CandidateChip/CandidateChip.scss`:

```scss
.candidate-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  min-height: 48px;
  border: none;
  border-radius: 24px;
  background: #e0e0e0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  &--ranked {
    background: #4caf50;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: white;
    color: #4caf50;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 600;
  }

  &__name {
    white-space: nowrap;
  }
}
```

- [ ] **Step 5: Create barrel export**

Create `src/components/molecules/CandidateChip/index.js`:

```js
export { CandidateChip } from './CandidateChip'
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- --run src/components/molecules/CandidateChip/CandidateChip.test.jsx`
Expected: 6 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/molecules/CandidateChip/
git commit -m "feat: add CandidateChip component for tap-to-rank"
```

---

## Chunk 2: TapRankBallot Component

### Task 2: Create TapRankBallot with Tests

**Files:**
- Create: `src/components/organisms/TapRankBallot/TapRankBallot.jsx`
- Create: `src/components/organisms/TapRankBallot/TapRankBallot.test.jsx`
- Create: `src/components/organisms/TapRankBallot/TapRankBallot.scss`
- Create: `src/components/organisms/TapRankBallot/index.js`

- [ ] **Step 1: Write the failing tests**

Create `src/components/organisms/TapRankBallot/TapRankBallot.test.jsx`:

```jsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TapRankBallot } from './TapRankBallot'

// Mock the voting context
vi.mock('../../../context/votingContext.jsx', () => ({
  useVoting: () => ({
    state: { sessionId: null, voterName: null, isHost: false, round: 1 },
    dispatch: vi.fn()
  })
}))

describe('TapRankBallot', () => {
  const candidates = ['Malta', 'Albanie', 'Taghazout']
  const voterName = 'Tom'

  test('renders all candidates as chips', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    expect(screen.getByText('Malta')).toBeInTheDocument()
    expect(screen.getByText('Albanie')).toBeInTheDocument()
    expect(screen.getByText('Taghazout')).toBeInTheDocument()
  })

  test('tapping candidate assigns next rank', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    fireEvent.click(screen.getByText('Malta'))
    expect(screen.getByText('1')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Albanie'))
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  test('tapping ranked candidate removes rank and shifts others', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    // Rank Malta as 1, Albanie as 2
    fireEvent.click(screen.getByText('Malta'))
    fireEvent.click(screen.getByText('Albanie'))

    // Remove Malta (rank 1)
    fireEvent.click(screen.getByText('Malta'))

    // Albanie should now be rank 1
    const albanieChip = screen.getByLabelText(/Albanie, ranked 1/)
    expect(albanieChip).toBeInTheDocument()
  })

  test('auto-completes last candidate when N-1 are ranked', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    // Rank 2 of 3 candidates
    fireEvent.click(screen.getByText('Malta'))
    fireEvent.click(screen.getByText('Albanie'))

    // Taghazout should auto-complete as rank 3
    expect(screen.getByLabelText(/Taghazout, ranked 3/)).toBeInTheDocument()
  })

  test('submit button disabled until all ranked', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    expect(submitButton).toBeDisabled()

    // Rank all candidates (2 taps, last auto-completes)
    fireEvent.click(screen.getByText('Malta'))
    fireEvent.click(screen.getByText('Albanie'))

    expect(submitButton).toBeEnabled()
  })

  test('shows progress indicator including auto-completed', () => {
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    expect(screen.getByText('0 of 3 ranked')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Malta'))
    expect(screen.getByText('1 of 3 ranked')).toBeInTheDocument()

    // Second tap triggers auto-complete, showing 3 of 3
    fireEvent.click(screen.getByText('Albanie'))
    expect(screen.getByText('3 of 3 ranked')).toBeInTheDocument()
  })

  test('produces correct rankings array on submit', () => {
    const { dispatch } = vi.mocked(require('../../../context/votingContext.jsx').useVoting)()
    render(<TapRankBallot candidates={candidates} voterName={voterName} />)

    // Rank in specific order: Albanie first, then Malta (Taghazout auto-completes)
    fireEvent.click(screen.getByText('Albanie'))
    fireEvent.click(screen.getByText('Malta'))

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SUBMIT_BALLOT',
      payload: ['Albanie', 'Malta', 'Taghazout']
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/organisms/TapRankBallot/TapRankBallot.test.jsx`
Expected: FAIL with "Cannot find module './TapRankBallot'"

- [ ] **Step 3: Write the implementation**

Create `src/components/organisms/TapRankBallot/TapRankBallot.jsx`:

```jsx
import React, { useState, useEffect } from 'react'
import { useVoting } from '../../../context/votingContext.jsx'
import { submitBallot } from '../../../services/ballotService'
import { Card } from '../../molecules/Card/Card'
import { CandidateChip } from '../../molecules/CandidateChip'
import { Button } from '../../atoms/Button/Button'
import { Heading } from '../../atoms/Heading/Heading'
import './TapRankBallot.scss'

export function TapRankBallot({ candidates, voterName }) {
  const { state, dispatch } = useVoting()
  const [rankings, setRankings] = useState([]) // Array of candidate names in rank order
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSupabaseVoter = state.sessionId && state.voterName && !state.isHost

  // Reset when candidates change
  useEffect(() => {
    setRankings([])
    setError('')
  }, [candidates, voterName])

  // Auto-complete last candidate
  useEffect(() => {
    if (rankings.length === candidates.length - 1) {
      const remaining = candidates.find(c => !rankings.includes(c))
      if (remaining) {
        setRankings(prev => [...prev, remaining])
      }
    }
  }, [rankings, candidates])

  function handleTap(name) {
    if (submitting) return
    setError('')

    const existingIndex = rankings.indexOf(name)
    if (existingIndex !== -1) {
      // Remove from rankings
      setRankings(prev => prev.filter(c => c !== name))
    } else {
      // Add to rankings (unless auto-complete will kick in)
      if (rankings.length < candidates.length) {
        setRankings(prev => [...prev, name])
      }
    }
  }

  function getRank(name) {
    const index = rankings.indexOf(name)
    return index !== -1 ? index + 1 : null
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (rankings.length !== candidates.length) {
      setError('Please rank all candidates')
      return
    }

    setError('')

    if (isSupabaseVoter) {
      setSubmitting(true)
      try {
        await submitBallot(state.sessionId, state.round, voterName, rankings)
        dispatch({ type: 'VOTER_SUBMITTED' })
      } catch (err) {
        setError(err.message || 'Failed to submit ballot. Please try again.')
        setSubmitting(false)
      }
    } else {
      dispatch({ type: 'SUBMIT_BALLOT', payload: rankings })
    }
  }

  const allRanked = rankings.length === candidates.length

  return (
    <Card className="tap-rank-ballot" padding="large">
      <Heading level={2} className="tap-rank-ballot__title">
        {voterName}'s Ballot
      </Heading>

      <p className="tap-rank-ballot__instruction">
        Tap candidates in order of preference
      </p>

      <form onSubmit={handleSubmit}>
        <div className="tap-rank-ballot__chips">
          {candidates.map(candidate => (
            <CandidateChip
              key={candidate}
              name={candidate}
              rank={getRank(candidate)}
              onTap={handleTap}
              disabled={submitting}
            />
          ))}
        </div>

        <p className="tap-rank-ballot__progress">
          {rankings.length} of {candidates.length} ranked
        </p>

        {error && (
          <div className="tap-rank-ballot__error" role="alert">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={!allRanked || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Ballot'}
        </Button>
      </form>
    </Card>
  )
}
```

- [ ] **Step 4: Create styles**

Create `src/components/organisms/TapRankBallot/TapRankBallot.scss`:

```scss
.tap-rank-ballot {
  &__title {
    margin-bottom: 8px;
  }

  &__instruction {
    color: #666;
    margin-bottom: 16px;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__progress {
    color: #666;
    font-size: 14px;
    margin-bottom: 16px;
    text-align: center;
  }

  &__error {
    background: #ffebee;
    color: #c62828;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    text-align: center;
  }
}
```

- [ ] **Step 5: Create barrel export**

Create `src/components/organisms/TapRankBallot/index.js`:

```js
export { TapRankBallot } from './TapRankBallot'
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- --run src/components/organisms/TapRankBallot/TapRankBallot.test.jsx`
Expected: 7 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/organisms/TapRankBallot/
git commit -m "feat: add TapRankBallot component"
```

---

## Chunk 3: Integration

### Task 3: Replace BallotForm with TapRankBallot in Voting Page

**Files:**
- Modify: `src/pages/Voting/Voting.jsx`

- [ ] **Step 1: Update import**

In `src/pages/Voting/Voting.jsx`, change:

```jsx
import BallotForm from '../../components/organisms/BallotForm/BallotForm';
```

To:

```jsx
import { TapRankBallot } from '../../components/organisms/TapRankBallot';
```

- [ ] **Step 2: Update component usage**

In `src/pages/Voting/Voting.jsx`, change:

```jsx
<BallotForm
  candidates={candidates}
  voterName={currentVoterName}
/>
```

To:

```jsx
<TapRankBallot
  candidates={candidates}
  voterName={currentVoterName}
/>
```

- [ ] **Step 3: Run all tests**

Run: `npm test -- --run`
Expected: All tests pass

- [ ] **Step 4: Manual verification**

Run: `npm run dev`
- Navigate to voting screen
- Verify tap-to-rank UI displays
- Test tapping to rank candidates
- Test undo by tapping ranked candidate
- Test auto-complete of last candidate
- Test submit button enables when all ranked

- [ ] **Step 5: Commit**

```bash
git add src/pages/Voting/Voting.jsx
git commit -m "feat: replace BallotForm with TapRankBallot"
```

---

## Summary

| Task | Description | Commit Message |
|------|-------------|----------------|
| 1 | CandidateChip component | `feat: add CandidateChip component for tap-to-rank` |
| 2 | TapRankBallot component | `feat: add TapRankBallot component` |
| 3 | Integration | `feat: replace BallotForm with TapRankBallot` |
