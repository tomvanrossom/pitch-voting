# QR Code Session Join

**Date:** 2026-03-13
**Status:** Approved

## Summary

Add QR code generation to the Host Dashboard, allowing voters to scan and join a session directly from their mobile devices instead of manually typing a 6-character code.

## Requirements

1. QR code displayed on Host Dashboard only (host shows to voters in person)
2. QR encodes a direct join URL with session code pre-filled
3. Prominent center block layout for easy projection/sharing
4. Fallback text code remains visible for manual entry

## URL Structure

The app supports a `?join=CODE` query parameter:

```
https://username.github.io/pitch-voting/?join=ABC123
```

When present:
- Home screen auto-navigates to JoinSession stage
- JoinSession auto-fills and submits the code lookup
- URL param is cleared after processing (prevents re-triggering on refresh)

## Technical Approach

**Library:** `qrcode.react` (~12KB)
- React-native component
- SVG output (scales perfectly for projection)
- Most popular React QR library

## Components

### QRCodeDisplay

New reusable component:

```jsx
// src/components/molecules/QRCodeDisplay/QRCodeDisplay.jsx
import { QRCodeSVG } from 'qrcode.react'

export function QRCodeDisplay({ code, baseUrl }) {
  const joinUrl = `${baseUrl}?join=${code}`
  return <QRCodeSVG value={joinUrl} size={160} />
}
```

Props:
- `code` (string): Session code (e.g., "ABC123")
- `baseUrl` (string): App base URL

### HostDashboard Changes

Replace current code chip section with prominent center block:

```
┌─────────────────────────────────┐
│  Host Dashboard                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │       ┌─────────┐         │  │
│  │       │ QR CODE │         │  │
│  │       │ 160x160 │         │  │
│  │       └─────────┘         │  │
│  │                           │  │
│  │  Scan to join or enter:   │  │
│  │        ABC123             │  │
│  └───────────────────────────┘  │
│                                 │
│  [ Start Voting (Round 1) ]     │
└─────────────────────────────────┘
```

### JoinSession Auto-fill

When `?join=CODE` is in the URL:

1. `App.jsx` reads query param on mount
2. Dispatches action with code to auto-navigate
3. `JoinSession` receives code as prop, auto-submits lookup
4. URL param cleared after processing

### Base URL Resolution

The base URL must work for both development and production:

```js
const baseUrl = window.location.origin + import.meta.env.BASE_URL
// Dev: http://localhost:3000/pitch-voting/
// Prod: https://username.github.io/pitch-voting/
```

## File Changes

| File | Change |
|------|--------|
| `package.json` | Add `qrcode.react` dependency |
| `src/components/molecules/QRCodeDisplay/` | New component |
| `src/pages/HostDashboard/HostDashboard.jsx` | Add QRCodeDisplay, update layout |
| `src/pages/JoinSession/JoinSession.jsx` | Accept `initialCode` prop, auto-submit |
| `src/pages/App.jsx` | Read `?join=` param, pass to JoinSession |

## Testing

- Unit test: QRCodeDisplay renders with correct URL
- Unit test: JoinSession auto-submits when initialCode provided
- Manual test: Full flow from QR scan to session join
