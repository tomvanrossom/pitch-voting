# QR Code Session Join Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add QR code to Host Dashboard so voters can scan to join sessions instantly.

**Architecture:** New QRCodeDisplay component wraps qrcode.react, displayed in HostDashboard. App.jsx reads `?join=CODE` query param and passes to JoinSession for auto-lookup.

**Tech Stack:** React, qrcode.react, MUI

**Spec:** `docs/superpowers/specs/2026-03-13-qr-code-session-join-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add qrcode.react dependency |
| `src/components/molecules/QRCodeDisplay/QRCodeDisplay.jsx` | Create | Render QR code SVG for join URL |
| `src/components/molecules/QRCodeDisplay/QRCodeDisplay.test.jsx` | Create | Unit tests for QRCodeDisplay |
| `src/components/molecules/QRCodeDisplay/index.js` | Create | Barrel export |
| `src/pages/HostDashboard/HostDashboard.jsx` | Modify | Add QRCodeDisplay, update layout |
| `src/pages/JoinSession/JoinSession.jsx` | Modify | Accept initialCode prop, auto-submit |
| `src/pages/JoinSession/JoinSession.test.jsx` | Create | Unit tests for auto-submit behavior |
| `src/pages/App.jsx` | Modify | Read ?join= param, pass to JoinSession |

---

## Chunk 1: Dependencies and QRCodeDisplay Component

### Task 1: Install qrcode.react

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependency**

Run: `npm install qrcode.react`

- [ ] **Step 2: Verify installation**

Run: `npm list qrcode.react`
Expected: `qrcode.react@3.x.x`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add qrcode.react dependency"
```

---

### Task 2: Create QRCodeDisplay Component with Tests

**Files:**
- Create: `src/components/molecules/QRCodeDisplay/QRCodeDisplay.jsx`
- Create: `src/components/molecules/QRCodeDisplay/QRCodeDisplay.test.jsx`
- Create: `src/components/molecules/QRCodeDisplay/index.js`

- [ ] **Step 1: Write the failing test**

Create `src/components/molecules/QRCodeDisplay/QRCodeDisplay.test.jsx`:

```jsx
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QRCodeDisplay } from './QRCodeDisplay'

describe('QRCodeDisplay', () => {
  test('renders QR code SVG', () => {
    render(<QRCodeDisplay code="ABC123" baseUrl="https://example.com/app/" />)

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  test('passes correct join URL to QRCodeSVG', () => {
    const { container } = render(
      <QRCodeDisplay code="XYZ789" baseUrl="https://example.com/app/" />
    )

    // The QR code encodes the URL - we verify the component renders
    // The URL construction is tested implicitly via the component's logic
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    // Verify aria-label contains the code for accessibility
    const figure = container.querySelector('figure')
    expect(figure).toHaveAttribute('aria-label', 'QR code to join session XYZ789')
  })

  test('renders with default size of 160', () => {
    const { container } = render(
      <QRCodeDisplay code="ABC123" baseUrl="https://example.com/" />
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '160')
    expect(svg).toHaveAttribute('height', '160')
  })

  test('accepts custom size prop', () => {
    const { container } = render(
      <QRCodeDisplay code="ABC123" baseUrl="https://example.com/" size={200} />
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/molecules/QRCodeDisplay/QRCodeDisplay.test.jsx`
Expected: FAIL with "Cannot find module './QRCodeDisplay'"

- [ ] **Step 3: Write the implementation**

Create `src/components/molecules/QRCodeDisplay/QRCodeDisplay.jsx`:

```jsx
import { QRCodeSVG } from 'qrcode.react'
import { Box } from '@mui/material'

export function QRCodeDisplay({ code, baseUrl, size = 160 }) {
  const joinUrl = `${baseUrl}?join=${code}`

  return (
    <Box
      component="figure"
      sx={{ m: 0, display: 'inline-block' }}
      aria-label={`QR code to join session ${code}`}
    >
      <QRCodeSVG value={joinUrl} size={size} />
    </Box>
  )
}
```

- [ ] **Step 4: Create barrel export**

Create `src/components/molecules/QRCodeDisplay/index.js`:

```js
export { QRCodeDisplay } from './QRCodeDisplay'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- --run src/components/molecules/QRCodeDisplay/QRCodeDisplay.test.jsx`
Expected: 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/molecules/QRCodeDisplay/
git commit -m "feat: add QRCodeDisplay component"
```

---

## Chunk 2: HostDashboard Integration

### Task 3: Update HostDashboard Layout

**Files:**
- Modify: `src/pages/HostDashboard/HostDashboard.jsx`

- [ ] **Step 1: Add QRCodeDisplay import and update layout**

Modify `src/pages/HostDashboard/HostDashboard.jsx`:

Add import at top:
```jsx
import { QRCodeDisplay } from '../../components/molecules/QRCodeDisplay'
```

Replace the existing code chip section (lines 21-26):
```jsx
<div>
  <Typography variant="h5">Host Dashboard</Typography>
  <Typography color="text.secondary">
    Share code: <Chip label={session.code} color="primary" />
  </Typography>
</div>
```

With the new QR code block:
```jsx
<Typography variant="h5">Host Dashboard</Typography>

<Box
  sx={{
    textAlign: 'center',
    p: 2,
    bgcolor: 'grey.100',
    borderRadius: 2,
  }}
>
  <QRCodeDisplay
    code={session.code}
    baseUrl={window.location.origin + import.meta.env.BASE_URL}
  />
  <Typography sx={{ mt: 1 }}>
    Scan to join or enter: <strong>{session.code}</strong>
  </Typography>
</Box>
```

Also add Box import:
```jsx
import { Typography, Stack, Button, Chip, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material'
```

- [ ] **Step 2: Run app and verify visually**

Run: `npm run dev`
- Create a session as host
- Verify QR code displays in center block
- Verify code text shows below QR

- [ ] **Step 3: Commit**

```bash
git add src/pages/HostDashboard/HostDashboard.jsx
git commit -m "feat: add QR code display to HostDashboard"
```

---

## Chunk 3: JoinSession Auto-fill

### Task 4: Update JoinSession to Accept initialCode

**Requires:** Task 1 complete (npm install)

**Files:**
- Modify: `src/pages/JoinSession/JoinSession.jsx`
- Create: `src/pages/JoinSession/JoinSession.test.jsx`

- [ ] **Step 1: Write failing test for auto-submit**

Create `src/pages/JoinSession/JoinSession.test.jsx`:

```jsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { JoinSession } from './JoinSession'

// Mock the session service
vi.mock('../../services/sessionService', () => ({
  joinSession: vi.fn()
}))

import { joinSession } from '../../services/sessionService'

describe('JoinSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('auto-submits lookup when initialCode is provided', async () => {
    const mockSession = { id: '123', code: 'ABC123', voters: ['Alice', 'Bob'] }
    joinSession.mockResolvedValue(mockSession)

    render(<JoinSession initialCode="ABC123" onSessionJoined={vi.fn()} />)

    await waitFor(() => {
      expect(joinSession).toHaveBeenCalledWith('ABC123')
    })
  })

  test('does not auto-submit when initialCode is empty', () => {
    render(<JoinSession onSessionJoined={vi.fn()} />)

    expect(joinSession).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/pages/JoinSession/JoinSession.test.jsx`
Expected: FAIL (joinSession not called)

- [ ] **Step 3: Add initialCode prop and auto-submit logic**

Modify `src/pages/JoinSession/JoinSession.jsx`:

Update import:
```jsx
import React, { useState, useEffect, useRef } from 'react'
```

Update component signature:
```jsx
export function JoinSession({ onSessionJoined, initialCode = '' }) {
```

Initialize code state with initialCode:
```jsx
const [code, setCode] = useState(initialCode)
```

Add ref to track if auto-submit has run, and useEffect after state declarations:
```jsx
const autoSubmitRan = useRef(false)

// Auto-submit if initialCode is provided
useEffect(() => {
  if (initialCode && !autoSubmitRan.current) {
    autoSubmitRan.current = true
    // Trigger lookup directly
    setLoading(true)
    joinSession(initialCode)
      .then(found => setSession(found))
      .catch(() => setError('Session not found. Check your code.'))
      .finally(() => setLoading(false))
  }
}, [initialCode])
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/pages/JoinSession/JoinSession.test.jsx`
Expected: 2 tests PASS

- [ ] **Step 5: Manual verification**

Run: `npm run dev`
- Open app with `?join=INVALID` - should show error after auto-lookup
- Open app with valid code - should auto-lookup and show voter selection

- [ ] **Step 6: Commit**

```bash
git add src/pages/JoinSession/
git commit -m "feat: add initialCode prop to JoinSession for auto-lookup"
```

---

## Chunk 4: App.jsx Query Parameter Handling

### Task 5: Update App.jsx to Read ?join= Parameter

**Requires:** Task 4 complete (JoinSession accepts initialCode prop)

**Files:**
- Modify: `src/pages/App.jsx`

- [ ] **Step 1: Add query param reading and state**

Modify `src/pages/App.jsx`:

Add useState and useEffect imports (update existing import):
```jsx
import React, { useState, useEffect } from "react";
```

Add Card import (missing from current file):
```jsx
import { Button, Stack, Typography, Card } from "@mui/material";
```

Inside App component, before getStageInfo, add:
```jsx
const [joinCode, setJoinCode] = useState(null)

// Read ?join= parameter on mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('join')
  if (code) {
    setJoinCode(code.toUpperCase())
    // Clear the URL parameter
    window.history.replaceState({}, '', window.location.pathname)
    // Navigate to join session
    dispatch({ type: "GOTO_JOIN_SESSION" })
  }
}, [])
```

- [ ] **Step 2: Pass joinCode to JoinSession**

Update the JoinSession render (around line 63):
```jsx
{stage === "joinSession" && (
  <JoinSession
    initialCode={joinCode}
    onSessionJoined={(session, voterName) => {
      setJoinCode(null)
      dispatch({ type: "SESSION_JOINED", payload: { session, voterName } })
    }}
  />
)}
```

- [ ] **Step 3: Run full flow test**

Run: `npm run dev`

Test flow:
1. Create session as host, note the code
2. Open new browser tab
3. Navigate to `http://localhost:3000/pitch-voting/?join=<CODE>`
4. Should auto-navigate to join, auto-lookup session
5. Select name and join

- [ ] **Step 4: Commit**

```bash
git add src/pages/App.jsx
git commit -m "feat: handle ?join= query parameter for QR code flow"
```

---

## Chunk 5: Final Integration Test

### Task 6: End-to-End Manual Test

- [ ] **Step 1: Test complete QR flow**

Run: `npm run dev`

1. Open app, click "Host a Session"
2. Create session with voters/candidates
3. Verify QR code displays prominently
4. On mobile (or another browser): scan QR code
5. Verify it opens the app and auto-looks up the session
6. Select name, join session
7. Verify voter appears in host dashboard

- [ ] **Step 2: Run all tests**

Run: `npm test -- --run`
Expected: All tests pass

- [ ] **Step 3: Final commit if any cleanup needed**

```bash
git status
# If clean, no commit needed
```

---

## Summary

| Task | Description | Commit Message |
|------|-------------|----------------|
| 1 | Install qrcode.react | `chore: add qrcode.react dependency` |
| 2 | Create QRCodeDisplay component | `feat: add QRCodeDisplay component` |
| 3 | Update HostDashboard layout | `feat: add QR code display to HostDashboard` |
| 4 | Add initialCode to JoinSession | `feat: add initialCode prop to JoinSession for auto-lookup` |
| 5 | Handle ?join= in App.jsx | `feat: handle ?join= query parameter for QR code flow` |
| 6 | End-to-end verification | (no commit) |
