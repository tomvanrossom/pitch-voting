# Configurable Voters and Candidates - Design Document

**Date:** 2026-02-23
**Status:** Approved
**Author:** Claude (with user approval)

---

## Overview

Transform the ranked-choice voting app from hardcoded voters/candidates to a configurable system where users can customize voting sessions. Configuration persists across sessions via localStorage, allowing reuse of the same voter/candidate lists for multiple voting rounds.

## Goals

1. Allow users to add/remove voters and candidates before voting
2. Save configuration to localStorage for reuse across sessions
3. Keep configuration separate from voting progress
4. Maintain existing voting flow and state management patterns

## Non-Goals

- Configuration templates or presets
- Import/export of configurations
- Real-time collaboration on config
- Configuration history/versioning

---

## Design Decisions

### Storage Architecture

**Two localStorage keys:**

1. **`voting-app-config`** - Persists across sessions
   ```json
   {
     "voters": ["Alice", "Bob", "Carol"],
     "candidates": ["Option A", "Option B", "Option C"]
   }
   ```

2. **`voting-app-state`** - Current voting progress (existing)
   ```json
   {
     "stage": "voting",
     "candidates": ["Option A", "Option B"],
     "voters": ["Alice", "Bob", "Carol"],
     "round": 2,
     "ballots": [...],
     "eliminatedHistory": [...],
     "scoreHistory": [...]
   }
   ```

**Lifecycle:**
- On app load → Load config from `voting-app-config`
- On START_VOTING → Snapshot config into voting state
- On RESET → Clear voting state, keep config intact
- Config changes only take effect on next START_VOTING

**Fallback behavior:**
If no config exists in localStorage, use hardcoded defaults:
```javascript
DEFAULT_CONFIG = {
  voters: ["Bert", "Birger", "Dave", "Ewoud", "Tom"],
  candidates: ["Taghazout", "Albanie", "Malta", "FuerteVentura",
               "Chartreuse (drank)", "Tunesie"]
}
```

**Rationale:** Separate storage allows config to persist across multiple voting sessions while keeping voting progress independent. Users can run multiple voting sessions with the same voter/candidate setup without re-entering data.

---

## UI Flow & Stage Transitions

### New Stage Flow

```
configure → setup → voting → announce → eliminated → winner
    ↑                                                    ↓
    └────────────── RESET ──────────────────────────────┘
```

### Configure Stage (NEW)

**Purpose:** Allow users to customize voters and candidates before voting begins.

**UI Elements:**
- Two sections: "Add Voters" and "Add Candidates"
- Each section contains:
  - Text input field with placeholder
  - "Add" button
  - List of current items displayed as chips with remove (×) buttons
- "Continue" button at bottom (enabled only when validation passes)
- Auto-saves config to localStorage on every change

**Validation (real-time):**
- Minimum 2 voters, maximum 50
- Minimum 2 candidates, maximum 50
- No empty strings
- No duplicate names (case-insensitive)
- Trim whitespace automatically
- Show error messages for validation failures

### Setup Stage (MODIFIED)

**Changes:**
- No longer the first screen
- Shows read-only summary of voters/candidates (existing behavior)
- Add "Edit Configuration" button to return to configure stage
- Keep existing "Start Voting" button

**Purpose:** Review configuration before starting, with option to edit.

### Stage Transitions

- `configure` → (Continue) → `setup`
- `setup` → (Edit Configuration) → `configure`
- `setup` → (Start Voting) → `voting`
- `winner` → (Restart) → `configure` (instead of setup)

### Initial Stage Logic

On app load, determine starting stage:

```javascript
if (voting-app-state exists && stage !== 'setup') {
  // Resume in-progress voting
  stage = saved stage
} else if (voting-app-config exists) {
  // Config exists, go to setup
  stage = 'setup'
} else {
  // First time, configure
  stage = 'configure'
}
```

---

## State Management & Data Flow

### Context Modifications

**Remove hardcoded constants:**
```javascript
// REMOVE:
const VOTERS = ["Bert", "Birger", "Dave", "Ewoud", "Tom"];
const OPTIONS = ["Taghazout", "Albanie", ...];
export { VOTERS, OPTIONS };
```

**Add config management:**
```javascript
const DEFAULT_CONFIG = { voters: [...], candidates: [...] };

function loadConfig() {
  try {
    const saved = localStorage.getItem('voting-app-config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch (error) {
    console.error("Failed to load config:", error);
    return DEFAULT_CONFIG;
  }
}

function saveConfig(config) {
  try {
    localStorage.setItem('voting-app-config', JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save config:", error);
  }
}

function clearConfig() {
  try {
    localStorage.removeItem('voting-app-config');
  } catch (error) {
    console.error("Failed to clear config:", error);
  }
}
```

### New Reducer Actions

**UPDATE_CONFIG** - Save configuration changes
```javascript
case "UPDATE_CONFIG":
  saveConfig(action.payload);
  // Don't modify state, just persist to localStorage
  return state;
```

**START_VOTING** - Snapshot config into voting state
```javascript
case "START_VOTING":
  const config = loadConfig();
  return {
    ...defaultInitialState,
    voters: config.voters,        // NEW
    candidates: config.candidates, // NEW (was OPTIONS)
    stage: "voting",
  };
```

**RESET** - Clear voting, keep config
```javascript
case "RESET":
  clearStorage(); // Only clears voting-app-state
  return {
    ...defaultInitialState,
    stage: "configure" // Go back to configure instead of setup
  };
```

### Validation Rules

All validation applied in ConfigList component:

- **Length:** 2-50 items for both voters and candidates
- **Empty strings:** Rejected
- **Whitespace:** Trimmed automatically
- **Duplicates:** Case-insensitive check, show error
- **Special characters:** Allow most chars, block only: `"`, `\`, control chars
- **Max length per item:** 100 characters

### State Structure Changes

**Add to voting state:**
```javascript
const initialState = {
  stage: "configure",          // NEW default stage
  voters: [],                  // NEW - dynamic voters
  candidates: [...OPTIONS],    // Changed from static OPTIONS
  round: 1,
  ballots: [],
  currentBallot: 0,
  eliminatedHistory: [],
  scoreHistory: [],
  loser: null,
  winner: null,
  pendingAnnouncement: false,
};
```

---

## Component Structure

### New Components

**Configure Page:**
```
src/pages/Configure/
├── Configure.jsx          # Main page component
├── Configure.scss         # Page styles
└── index.js              # Export
```

**ConfigForm Organism:**
```
src/components/organisms/ConfigForm/
├── ConfigForm.jsx         # Two-section form (voters + candidates)
├── ConfigForm.scss        # Form styles
└── index.js
```

**ConfigList Molecule:**
```
src/components/molecules/ConfigList/
├── ConfigList.jsx         # Input + list with add/remove
├── ConfigList.scss
└── index.js
```

### Component Hierarchy

```
Configure (page)
  └── ConfigForm (organism)
        ├── Heading - "Configure Voting Session"
        ├── ConfigList (molecule) - Voters section
        │     ├── Heading (atom) - "Voters"
        │     ├── FormField (molecule)
        │     │     ├── Label (atom)
        │     │     └── Input (atom)
        │     ├── Button (atom) - "Add Voter"
        │     └── ChipGroup (molecule) - Display voters
        │           └── Chip (atom) × N - Each with remove button
        ├── ConfigList (molecule) - Candidates section
        │     ├── Heading (atom) - "Candidates"
        │     ├── FormField (molecule)
        │     ├── Button (atom) - "Add Candidate"
        │     └── ChipGroup (molecule)
        └── Button (atom) - "Continue to Setup"
```

### ConfigList Props Interface

```javascript
<ConfigList
  title="Voters"              // Section title
  items={["Alice", "Bob"]}    // Current items
  onAdd={(name) => {...}}     // Add new item
  onRemove={(name) => {...}}  // Remove item
  placeholder="Enter voter name..."
  maxItems={50}               // Validation
  minItems={2}                // Validation
  singularLabel="voter"       // For error messages
  pluralLabel="voters"        // For error messages
/>
```

### Modified Components

**App.jsx:**
- Add configure stage route
- Update initial stage logic

**Setup.jsx:**
- Add "Edit Configuration" button
- Pass voters/candidates as props to VoterSetupCard

**VoterSetupCard.jsx:**
- Already receives voters/candidates as props (no change needed)

**Voting.jsx, Winner.jsx, etc.:**
- Replace `VOTERS[currentBallot]` with `state.voters[currentBallot]`
- Replace `OPTIONS` imports with dynamic `state.candidates`

---

## Data Migration Strategy

### Backward Compatibility

**For existing users with voting in progress:**

1. On first load after update:
   - Check if `voting-app-state` exists
   - If yes, extract voters/candidates from it
   - Create `voting-app-config` with those values
   - Continue from current stage

2. If no state exists:
   - Create `voting-app-config` with DEFAULT_CONFIG
   - Show configure stage

**Migration code:**
```javascript
function migrateToConfigurableSystem() {
  const state = loadStateFromStorage();
  const config = loadConfig();

  // If state exists but config doesn't, extract config from state
  if (state && !config) {
    const extractedConfig = {
      voters: DEFAULT_CONFIG.voters, // Can't extract, use default
      candidates: state.candidates || DEFAULT_CONFIG.candidates
    };
    saveConfig(extractedConfig);
  }
}
```

---

## Testing Considerations

### Unit Tests

**votingContext.test.jsx:**
- Test loadConfig() with valid/invalid/missing data
- Test saveConfig() success and error cases
- Test UPDATE_CONFIG action doesn't modify state
- Test START_VOTING snapshots config correctly
- Test RESET preserves config

**ConfigList.test.jsx (NEW):**
- Test adding valid items
- Test adding duplicate items (should show error)
- Test removing items
- Test validation (min/max, empty strings)
- Test whitespace trimming

**ConfigForm.test.jsx (NEW):**
- Test form submission
- Test validation blocking continue button
- Test localStorage save on changes

### Integration Tests

- Configure voters → Start voting → Verify correct voters used
- Configure → Reset → Verify config persists
- Edit config from setup → Verify changes saved
- Load app with existing config → Verify auto-loads

---

## Edge Cases & Error Handling

### Edge Cases

1. **User deletes all voters/candidates:**
   - Disable "Continue" button
   - Show error: "Add at least 2 voters/candidates"

2. **localStorage full:**
   - Catch QuotaExceededError
   - Show alert: "Unable to save configuration"
   - Allow continue anyway (use in-memory config)

3. **Corrupted config in localStorage:**
   - loadConfig() catches parse error
   - Falls back to DEFAULT_CONFIG
   - Logs warning to console

4. **Config deleted while voting in progress:**
   - Voting state has snapshot, continues normally
   - Config recreated on next RESET

5. **User edits config during voting:**
   - Changes saved to localStorage
   - Active voting unaffected (uses snapshot)
   - Next voting session uses new config

### Validation Edge Cases

- **Unicode/emoji in names:** Allow (e.g., "Alice 🎉")
- **Very long names:** Truncate at 100 chars
- **Leading/trailing spaces:** Auto-trim
- **Multiple spaces:** Collapse to single space
- **Case sensitivity:** "alice" and "Alice" are duplicates

---

## Implementation Notes

### Order of Implementation

1. Add config storage functions to votingContext.jsx
2. Create ConfigList molecule
3. Create ConfigForm organism
4. Create Configure page
5. Update App.jsx with configure stage
6. Modify existing components to use dynamic voters/candidates
7. Add migration logic
8. Update tests

### Files to Modify

**New files:**
- `src/pages/Configure/Configure.jsx`
- `src/pages/Configure/Configure.scss`
- `src/pages/Configure/index.js`
- `src/components/organisms/ConfigForm/ConfigForm.jsx`
- `src/components/organisms/ConfigForm/ConfigForm.scss`
- `src/components/molecules/ConfigList/ConfigList.jsx`
- `src/components/molecules/ConfigList/ConfigList.scss`

**Modified files:**
- `src/context/votingContext.jsx` - Add config management
- `src/pages/App.jsx` - Add configure stage
- `src/pages/Setup/Setup.jsx` - Add edit button
- `src/pages/Voting/Voting.jsx` - Use dynamic voters
- `src/pages/Winner/Winner.jsx` - Use dynamic voters/candidates
- `src/pages/Eliminated/Eliminated.jsx` - Use dynamic candidates
- `src/components/organisms/VoterSetupCard/VoterSetupCard.jsx` - Already dynamic

### Breaking Changes

None. Existing voting sessions will continue to work. Default config matches current hardcoded values, so behavior is identical for new users.

---

## Future Enhancements (Out of Scope)

- Configuration templates (save multiple configs)
- Import/export config as JSON
- Bulk add voters/candidates (paste list)
- Configuration history
- Share config via URL
- Preset configurations (common voting scenarios)

---

## Success Criteria

1. ✅ Users can add/remove voters and candidates
2. ✅ Configuration persists across browser sessions
3. ✅ Configuration survives voting reset
4. ✅ All tests pass
5. ✅ No breaking changes for existing users
6. ✅ Clean git history with atomic commits
