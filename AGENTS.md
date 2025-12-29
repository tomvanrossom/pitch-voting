# AGENTS.md

> **Quick Reference for AI Assistants & Developers**  
> Project: Ranked-Choice Voting Web App

---

## 🏗️ Architecture Overview

This project follows **Atomic Design principles** with a modern React/Vite stack.

### Core Philosophy
- **Separation of Concerns**: UI, logic, state, and styles are cleanly separated
- **Component Hierarchy**: Atoms → Molecules → Organisms → Templates → Pages
- **Modern Standards**: SCSS `@use` modules, ES6+, functional components with hooks
- **Single Responsibility**: Each file/folder has one clear purpose

---

## 📁 Project Structure

```
src/
├── index.jsx                    # Entry point (14 lines)
├── components/                  # UI Components (Atomic Design)
│   ├── atoms/                   # Basic building blocks
│   │   ├── Button/              # Reusable button with variants
│   │   ├── Chip/                # Badge/label component
│   │   ├── Heading/             # Semantic headings (h1-h4)
│   │   ├── Icon/                # Emoji wrapper with sizes
│   │   ├── Label/               # Form labels
│   │   └── Select/              # Dropdown select
│   ├── molecules/               # Simple combinations
│   │   ├── Alert/               # Success/warning/error alerts
│   │   ├── Card/                # Container with shadow
│   │   ├── ChipGroup/           # Group of chips
│   │   ├── FormField/           # Label + Input + Error
│   │   └── StepperItem/         # Single progress step
│   ├── organisms/               # Complex components
│   │   ├── BallotForm/          # Voting form (drag & drop)
│   │   ├── ResultsTable/        # Final results display
│   │   ├── Stepper/             # Multi-step progress indicator
│   │   ├── VoterSetupCard/      # Initial setup screen
│   │   └── VotingInfoPanel/     # Candidate info panel
│   └── templates/               # Page layouts
│       └── VotingLayout/        # Main app layout
├── pages/                       # Page components (stages)
│   ├── App.jsx                  # Main orchestrator (32 lines)
│   ├── Setup/                   # Stage 1: Initial setup
│   ├── Voting/                  # Stage 2: Ballot submission
│   ├── Announce/                # Stage 3: Suspense reveal
│   ├── Eliminated/              # Stage 4: Show loser
│   └── Winner/                  # Stage 5: Final results
├── context/                     # State Management
│   └── votingContext.jsx        # React Context + useReducer
├── utils/                       # Pure Business Logic
│   └── votingUtils.js           # Borda count algorithm
└── styles/                      # Design System
    ├── _tokens.scss             # Design tokens (colors, spacing, etc.)
    ├── _mixins.scss             # Reusable SCSS mixins
    └── global.scss              # Global styles
```

---

## 🎨 Component Patterns

### Folder Structure (Per Component)
```
ComponentName/
├── ComponentName.jsx            # Component logic
├── ComponentName.scss           # Component styles
└── index.js                     # Export file (optional)
```

### Naming Conventions
- **Files**: PascalCase (`Button.jsx`, `Alert.scss`)
- **Folders**: PascalCase (`Button/`, `VotingLayout/`)
- **Components**: Named exports (`export function Button()`)
- **No Suffixes**: ❌ `ButtonComponent.jsx` ✅ `Button.jsx`
- **No "Page" Suffix**: ❌ `SetupPage/` ✅ `Setup/` (already in `pages/`)

### Import Patterns
```jsx
// Atomic components - direct imports
import { Button } from '../../components/atoms/Button/Button';
import { Card } from '../../components/molecules/Card/Card';

// Pages - via index.js
import { Setup } from './Setup';

// Context & Utils
import { useVoting } from '../../context/votingContext.jsx';
import { weightedFindLoser } from '../../utils/votingUtils';
```

---

## 🎨 SCSS Architecture

### Modern `@use` Syntax (Not `@import`)
```scss
// ✅ CORRECT
@use '../../styles/tokens' as *;
@use '../../styles/mixins' as *;

// ❌ DEPRECATED (Don't use!)
@import '../../styles/tokens';
```

### Color Functions
```scss
// ✅ MODERN
@use 'sass:color';
color.scale($color-primary, $lightness: 60%);

// ❌ DEPRECATED
lighten($color-primary, 40%);
darken($color-primary, 20%);
```

### Design Tokens Location
- **Colors**: `styles/_tokens.scss` (`$color-primary`, `$color-success`, etc.)
- **Spacing**: `styles/_tokens.scss` (`$spacing-sm`, `$spacing-md`, etc.)
- **Typography**: `styles/_tokens.scss` (`$font-size-base`, `$font-weight-medium`, etc.)

---

## 📦 State Management

### Context Pattern
```jsx
// votingContext.jsx provides:
const { state, dispatch } = useVoting();

// State structure:
state = {
  stage: 'setup' | 'voting' | 'announce' | 'eliminated' | 'winner',
  candidates: string[],
  ballots: string[][],
  round: number,
  eliminatedHistory: string[],
  winner: string | null,
  // ... more
}

// Actions:
dispatch({ type: 'START_VOTING' });
dispatch({ type: 'SUBMIT_BALLOT', payload: ranking });
dispatch({ type: 'NEXT_ROUND' });
// ... more
```

### When to Use Utils vs Context
- **Context**: State management, React-specific logic
- **Utils**: Pure functions, algorithms, no React dependencies

---

## 🚀 Key Technologies

| Technology | Purpose | Notes |
|------------|---------|-------|
| **React 18** | UI framework | Functional components + hooks only |
| **Vite** | Build tool | Fast dev server, HMR |
| **SCSS** | Styling | Modern `@use` syntax |
| **React Context** | State | Global state with useReducer |
| **Atomic Design** | Architecture | Component hierarchy |

---

## 🔧 Common Tasks

### Adding a New Component
1. Create folder: `src/components/atoms/NewComponent/`
2. Add files: `NewComponent.jsx`, `NewComponent.scss`
3. Use modern SCSS: `@use '../../styles/tokens' as *;`
4. Export: `export function NewComponent() { ... }`

### Adding a New Page
1. Create folder: `src/pages/NewStage/`
2. Add files: `NewStage.jsx`, `NewStage.scss` (if needed), `index.js`
3. Export in `index.js`: `export { NewStage } from './NewStage';`
4. Import in `App.jsx` and add conditional render

### Adding Utility Functions
1. Add to `src/utils/votingUtils.js` or create new file
2. Export as named export: `export function myUtil() { ... }`
3. Import where needed: `import { myUtil } from '../utils/votingUtils';`

---

## ⚠️ Important Rules

### DO ✅
- Use `@use` for SCSS imports (not `@import`)
- Use `color.scale()` for color manipulation (not `lighten`/`darken`)
- Keep components small and focused (Single Responsibility)
- Use semantic HTML (`<section>`, `<article>`, `<nav>`, etc.)
- Extract business logic to `utils/`
- Use `git mv` when moving files (preserve history)

### DON'T ❌
- Don't use `@import` in SCSS (deprecated)
- Don't use `lighten()`/`darken()` (deprecated)
- Don't mix business logic in components/context
- Don't create files in `src/` root (only `index.jsx` belongs there)
- Don't add redundant suffixes (`ButtonComponent`, `SetupPage`)
- Don't use regular `mv` for tracked files (use `git mv`)

---

## 📊 File Organization Guidelines

### Component Complexity Levels

**Atoms** (5-30 lines)
- Single purpose (button, input, label)
- Highly reusable
- No business logic
- Example: `Button.jsx`, `Icon.jsx`

**Molecules** (30-80 lines)
- Combines 2-5 atoms
- Simple interactions
- Example: `FormField.jsx` (Label + Input + Error)

**Organisms** (80-200 lines)
- Complex functionality
- Multiple molecules/atoms
- Contains business logic
- Example: `BallotForm.jsx`, `ResultsTable.jsx`

**Templates** (50-150 lines)
- Page layouts
- No business logic
- Example: `VotingLayout.jsx`

**Pages** (30-100 lines)
- Connects to context
- Orchestrates organisms
- Example: `Voting.jsx`, `Winner.jsx`

---

## 🎯 Code Quality Standards

### React Patterns
```jsx
// ✅ Functional components only
export function MyComponent({ prop1, prop2 }) { ... }

// ✅ Hooks at top level
const [state, setState] = useState();
const { data } = useContext(MyContext);

// ✅ Named exports
export function Button() { ... }

// ❌ No default exports for components
// (except App.jsx for historical reasons)
```

### SCSS Best Practices
```scss
// ✅ BEM naming
.component {
  &__element { }
  &--modifier { }
}

// ✅ Use design tokens
color: $color-primary;
padding: $spacing-md;

// ❌ Don't hardcode values
color: #1976d2;  // NO!
padding: 16px;   // NO!
```

---

## 📝 Testing & Building

```bash
# Development server
npm run dev          # Runs on http://localhost:3000

# Production build
npm run build        # Output: dist/

# Preview production build
npm run preview
```

---

## 🔍 Quick Checklist for Changes

Before committing changes, verify:
- [ ] No unused imports
- [ ] Using `@use` (not `@import`) in SCSS
- [ ] Using modern color functions (`color.scale()`)
- [ ] Components in correct atomic level folder
- [ ] Business logic in `utils/` (not components)
- [ ] No hardcoded values (use design tokens)
- [ ] Semantic HTML tags used appropriately
- [ ] `npm run build` succeeds
- [ ] No console errors in dev server

---

## 📚 Additional Notes

### Single Page App (SPA)
- All "pages" are React components, not routes
- No routing library needed
- State-based navigation via `stage` in context
- Smooth transitions between stages

### Voting Algorithm
- **Borda Count Method**: Rank 1 = 1 point, Rank 2 = 2 points, etc.
- **Loser**: Candidate with highest score (worst rank)
- **Location**: `utils/votingUtils.js`
- **Pure function**: Easy to test in isolation

### Design System
All design tokens centralized in `styles/_tokens.scss`:
- Colors: Primary, Secondary, Success, Error, etc.
- Spacing: xs, sm, md, lg, xl
- Typography: Font sizes, weights
- Shadows, radii, breakpoints

---

**Last Updated**: 2025-12-29  
**Status**: Production-ready ✅  
**Build**: Clean (0 warnings, 0 errors)
