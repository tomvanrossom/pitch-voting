# Tap-to-Rank Ballot

**Date:** 2026-03-13
**Status:** Approved

## Summary

Replace the dropdown-based BallotForm with a touch-friendly tap-to-rank interface. Voters tap candidates in preference order rather than selecting from dropdowns.

## Problem

The current BallotForm uses `<select>` dropdowns for ranking candidates. This creates a mental model mismatch — ranking feels like it should be direct manipulation (drag or tap), not dropdown selection. For 5-7 candidates on touch devices, the dropdown approach is tedious.

## Solution

A new `TapRankBallot` component where candidates display as large tappable chips. Voters tap candidates in preference order to assign ranks.

## Interaction Model

1. **Tap unranked candidate** → assigns next available rank (1, 2, 3...)
2. **Tap ranked candidate** → removes rank, shifts higher ranks down
3. **Auto-complete** → when N-1 candidates ranked, last candidate auto-assigned final rank
4. **Submit** → enabled only when all candidates ranked

## Visual States

| State | Background | Text | Badge |
|-------|------------|------|-------|
| Unranked | `#e0e0e0` (grey) | Dark | None |
| Ranked | `#4caf50` (green) | White | Circular rank number |
| Disabled | Same + 50% opacity | — | — |

## Component Structure

```
TapRankBallot
├── Instruction: "Tap candidates in order of preference"
├── CandidateChip[] (flex-wrap grid)
│   ├── rank badge (if ranked)
│   └── candidate name
├── Progress: "3 of 6 ranked"
├── Error message (conditional)
└── Submit button
```

## Props Interface

```typescript
interface TapRankBallotProps {
  candidates: string[]
  voterName: string
}
```

Same interface as current BallotForm for drop-in replacement.

## Output

Produces same `rankings: string[]` array as current implementation, compatible with existing `SUBMIT_BALLOT` action and Supabase ballot submission.

## Touch Guidelines

- Minimum chip height: 48px (Material Design touch target)
- Flex-wrap layout for responsive grid
- Visual feedback on tap (brief scale animation)
- Large, readable text

## File Changes

| File | Change |
|------|--------|
| `src/components/organisms/TapRankBallot/TapRankBallot.jsx` | New component |
| `src/components/organisms/TapRankBallot/TapRankBallot.scss` | Styles |
| `src/components/organisms/TapRankBallot/TapRankBallot.test.jsx` | Tests |
| `src/components/organisms/TapRankBallot/index.js` | Barrel export |
| `src/pages/Voting/Voting.jsx` | Import TapRankBallot instead of BallotForm |

## Testing

- Unit test: tapping assigns sequential ranks
- Unit test: tapping ranked chip removes and shifts ranks
- Unit test: auto-completes last candidate
- Unit test: submit disabled until all ranked
- Unit test: produces correct rankings array
