# Touch-Friendly Voter Selection

**Date:** 2026-03-13
**Status:** Approved

## Summary

Replace the dropdown-based voter selection in JoinSession with touch-friendly tap-to-select chips. Voters tap their name from a grid of chips instead of selecting from a dropdown menu.

## Problem

After entering a session code, voters must select their name from an MUI `<Select>` dropdown. This requires multiple taps (open dropdown, scroll, select) and has small touch targets. For 5-8 voters on mobile, this is tedious.

## Solution

A new `VoterChip` component showing voter names as large tappable chips. Single-select behavior - tapping a chip selects it, tapping another moves the selection.

## Interaction Model

1. Session found - display voter names as chips in flex-wrap grid
2. Tap a name - chip highlights (green selected state)
3. Tap different name - selection moves (single-select)
4. "Join Session" button enabled when a name is selected
5. Tap Join - enters session with selected voter

## Visual States

| State | Background | Text |
|-------|------------|------|
| Unselected | `#e0e0e0` (grey) | Dark |
| Selected | `#4caf50` (green) | White |

Consistent with CandidateChip colors from TapRankBallot.

## Component Structure

```
JoinSession (after session found)
├── Heading: "Select Your Name"
├── VoterChip[] (flex-wrap grid)
│   └── voter name (selected state if chosen)
└── Join Session button (disabled until selection)
```

## Props Interface

```typescript
interface VoterChipProps {
  name: string
  selected: boolean
  onSelect: (name: string) => void
  disabled?: boolean
}
```

## Touch Guidelines

- Minimum chip height: 48px (Material Design touch target)
- Flex-wrap layout for responsive grid
- Visual feedback on tap (brief scale animation)
- Large, readable text

## File Changes

| File | Change |
|------|--------|
| `src/components/molecules/VoterChip/VoterChip.jsx` | New component |
| `src/components/molecules/VoterChip/VoterChip.scss` | Styles |
| `src/components/molecules/VoterChip/VoterChip.test.jsx` | Tests |
| `src/components/molecules/VoterChip/index.js` | Barrel export |
| `src/pages/JoinSession/JoinSession.jsx` | Replace Select with VoterChip grid |

## Testing

- Unit test: renders all voter names as chips
- Unit test: tapping chip calls onSelect with name
- Unit test: selected chip has selected class
- Unit test: disabled chip is not clickable
- Integration test: only one chip selected at a time
- Integration test: Join button disabled until selection
- Integration test: Join triggers onSessionJoined with correct voter
