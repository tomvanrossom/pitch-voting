# Voter Chip Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace dropdown voter selection with touch-friendly tap-to-select chips in JoinSession.

**Architecture:** New `VoterChip` molecule component with selected/unselected states. JoinSession replaces MUI Select with a grid of VoterChips. Single-select behavior managed by parent state.

**Tech Stack:** React, SCSS

**Spec:** `docs/superpowers/specs/2026-03-13-voter-chip-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/molecules/VoterChip/VoterChip.jsx` | Create | Tappable chip with selected/unselected states |
| `src/components/molecules/VoterChip/VoterChip.scss` | Create | Chip styles matching CandidateChip colors |
| `src/components/molecules/VoterChip/VoterChip.test.jsx` | Create | Unit tests for chip states and interactions |
| `src/components/molecules/VoterChip/index.js` | Create | Barrel export |
| `src/pages/JoinSession/JoinSession.jsx` | Modify | Replace Select with VoterChip grid |
| `src/pages/JoinSession/JoinSession.test.jsx` | Create | Integration tests for voter selection |

---

## Chunk 1: VoterChip Component

### Task 1: Create VoterChip with Tests

**Files:**
- Create: `src/components/molecules/VoterChip/VoterChip.jsx`
- Create: `src/components/molecules/VoterChip/VoterChip.test.jsx`
- Create: `src/components/molecules/VoterChip/VoterChip.scss`
- Create: `src/components/molecules/VoterChip/index.js`

- [ ] **Step 1: Write the failing tests**

Create `src/components/molecules/VoterChip/VoterChip.test.jsx`:

```jsx
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VoterChip } from './VoterChip'

describe('VoterChip', () => {
  test('renders voter name', () => {
    render(<VoterChip name="Alice" selected={false} onSelect={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  test('calls onSelect with name when clicked', () => {
    const onSelect = vi.fn()
    render(<VoterChip name="Alice" selected={false} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith('Alice')
  })

  test('applies selected class when selected', () => {
    render(<VoterChip name="Alice" selected={true} onSelect={vi.fn()} />)
    const chip = screen.getByRole('button')
    expect(chip).toHaveClass('voter-chip--selected')
  })

  test('does not have selected class when unselected', () => {
    render(<VoterChip name="Alice" selected={false} onSelect={vi.fn()} />)
    const chip = screen.getByRole('button')
    expect(chip).not.toHaveClass('voter-chip--selected')
  })

  test('is disabled when disabled prop is true', () => {
    render(<VoterChip name="Alice" selected={false} onSelect={vi.fn()} disabled />)
    const chip = screen.getByRole('button')
    expect(chip).toBeDisabled()
  })

  test('does not call onSelect when disabled', () => {
    const onSelect = vi.fn()
    render(<VoterChip name="Alice" selected={false} onSelect={onSelect} disabled />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/molecules/VoterChip/VoterChip.test.jsx`
Expected: FAIL with "Cannot find module './VoterChip'"

- [ ] **Step 3: Write the implementation**

Create `src/components/molecules/VoterChip/VoterChip.jsx`:

```jsx
import './VoterChip.scss'

export function VoterChip({ name, selected, onSelect, disabled = false }) {
  return (
    <button
      type="button"
      className={`voter-chip ${selected ? 'voter-chip--selected' : ''}`}
      onClick={() => onSelect(name)}
      disabled={disabled}
      aria-pressed={selected}
    >
      {name}
    </button>
  )
}
```

- [ ] **Step 4: Create styles**

Create `src/components/molecules/VoterChip/VoterChip.scss`:

```scss
.voter-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
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

  &--selected {
    background: #4caf50;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

- [ ] **Step 5: Create barrel export**

Create `src/components/molecules/VoterChip/index.js`:

```js
export { VoterChip } from './VoterChip'
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- --run src/components/molecules/VoterChip/VoterChip.test.jsx`
Expected: 6 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/molecules/VoterChip/
git commit -m "feat: add VoterChip component for touch-friendly selection"
```

---

## Chunk 2: JoinSession Integration

### Task 2: Replace Select with VoterChip Grid

**Files:**
- Modify: `src/pages/JoinSession/JoinSession.jsx`
- Create: `src/pages/JoinSession/JoinSession.test.jsx`

- [ ] **Step 1: Write the integration tests**

Create `src/pages/JoinSession/JoinSession.test.jsx`:

```jsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { JoinSession } from './JoinSession'

// Mock the session service
vi.mock('../../services/sessionService', () => ({
  joinSession: vi.fn()
}))

import { joinSession } from '../../services/sessionService'

describe('JoinSession voter selection', () => {
  const mockSession = {
    id: 'session-123',
    voters: ['Alice', 'Bob', 'Charlie']
  }

  beforeEach(() => {
    vi.clearAllMocks()
    joinSession.mockResolvedValue(mockSession)
  })

  test('shows voter chips after session lookup', async () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    // Enter code and submit
    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    // Wait for chips to appear
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })
  })

  test('selecting a voter chip highlights it', async () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    await waitFor(() => screen.getByText('Alice'))

    fireEvent.click(screen.getByText('Alice'))
    expect(screen.getByText('Alice').closest('button')).toHaveClass('voter-chip--selected')
  })

  test('only one voter can be selected at a time', async () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    await waitFor(() => screen.getByText('Alice'))

    fireEvent.click(screen.getByText('Alice'))
    fireEvent.click(screen.getByText('Bob'))

    expect(screen.getByText('Alice').closest('button')).not.toHaveClass('voter-chip--selected')
    expect(screen.getByText('Bob').closest('button')).toHaveClass('voter-chip--selected')
  })

  test('join button disabled until voter selected', async () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    await waitFor(() => screen.getByText('Alice'))

    const joinButton = screen.getByRole('button', { name: /join session/i })
    expect(joinButton).toBeDisabled()

    fireEvent.click(screen.getByText('Alice'))
    expect(joinButton).toBeEnabled()
  })

  test('join button calls onSessionJoined with correct voter', async () => {
    const onSessionJoined = vi.fn()
    render(<JoinSession onSessionJoined={onSessionJoined} />)

    fireEvent.change(screen.getByLabelText(/session code/i), { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByRole('button', { name: /find session/i }))

    await waitFor(() => screen.getByText('Bob'))

    fireEvent.click(screen.getByText('Bob'))
    fireEvent.click(screen.getByRole('button', { name: /join session/i }))

    expect(onSessionJoined).toHaveBeenCalledWith(mockSession, 'Bob')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/pages/JoinSession/JoinSession.test.jsx`
Expected: FAIL (tests expect VoterChip but current code uses Select)

- [ ] **Step 3: Update JoinSession implementation**

Modify `src/pages/JoinSession/JoinSession.jsx`:

Replace the imports at the top:

```jsx
import React, { useState, useEffect, useRef } from 'react'
import { TextField, Button, Typography, Stack } from '@mui/material'
import { joinSession } from '../../services/sessionService'
import { Card } from '../../components/molecules/Card/Card'
import { VoterChip } from '../../components/molecules/VoterChip'
```

Replace the voter selection section (the `if (session)` block):

```jsx
  if (session) {
    return (
      <Card>
        <Typography variant="h5" gutterBottom>Select Your Name</Typography>
        <Stack spacing={2}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {session.voters.map(voter => (
              <VoterChip
                key={voter}
                name={voter}
                selected={selectedVoter === voter}
                onSelect={setSelectedVoter}
              />
            ))}
          </div>
          <Button variant="contained" onClick={handleJoin} disabled={!selectedVoter} fullWidth>
            Join Session
          </Button>
        </Stack>
      </Card>
    )
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/pages/JoinSession/JoinSession.test.jsx`
Expected: 5 tests PASS

- [ ] **Step 5: Run all tests**

Run: `npm test -- --run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/pages/JoinSession/
git commit -m "feat: replace dropdown with VoterChip grid in JoinSession"
```

---

## Summary

| Task | Description | Commit Message |
|------|-------------|----------------|
| 1 | VoterChip component | `feat: add VoterChip component for touch-friendly selection` |
| 2 | JoinSession integration | `feat: replace dropdown with VoterChip grid in JoinSession` |
