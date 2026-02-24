# Professional Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the voting app from friendly/colorful design to professional dashboard aesthetic with subtle colors, bold typography, and structured layouts.

**Architecture:** This is primarily a visual redesign affecting SCSS tokens and component styles, with minor JSX changes to add section structure. All business logic and functionality remains unchanged. We'll work systematically through design tokens first, then components, then pages, then structure enhancements.

**Tech Stack:** React 19, SCSS (Sass), Vite

---

## Task 1: Update Design Tokens

Transform the color palette from vibrant to professional neutral/gray tones.

**Files:**
- Modify: `src/styles/_tokens.scss`

**Step 1: Update primary colors to professional blues**

Replace the existing primary color definitions:

```scss
// Colors - Professional dashboard palette
$color-primary: #2563eb;
$color-primary-dark: #1d4ed8;
$color-primary-light: #3b82f6;
$color-primary-lighter: #eff6ff;
```

**Step 2: Add complete gray scale palette**

Add after primary colors:

```scss
// Neutral gray scale (professional dashboard)
$color-gray-50: #fafafa;
$color-gray-100: #f9fafb;
$color-gray-200: #f3f4f6;
$color-gray-300: #d1d5db;
$color-gray-400: #9ca3af;
$color-gray-500: #6b7280;
$color-gray-600: #4b5563;
$color-gray-700: #374151;
$color-gray-800: #1f2937;
$color-gray-900: #111827;
```

**Step 3: Update text colors to near-black grays**

Replace existing text color definitions:

```scss
// Text colors (professional)
$color-text-primary: #111827;
$color-text-secondary: #6b7280;
$color-text-tertiary: #9ca3af;
$color-heading: #1f2937;
$color-heading-secondary: #374151;
```

**Step 4: Update status colors to professional tones**

Replace existing status colors:

```scss
$color-success: #059669;
$color-warning: #d97706;
$color-error: #dc2626;
$color-info: #0284c7;
```

**Step 5: Update background colors**

Replace existing background definitions:

```scss
// Backgrounds
$color-background: #ffffff;
$color-surface: #f8f9fa;
$color-surface-secondary: #f9fafb;
```

**Step 6: Update status background colors**

Replace:

```scss
// Status backgrounds (subtle)
$color-success-bg: #d1fae5;
$color-error-bg: #fee2e2;
$color-warning-bg: #fed7aa;
$color-info-bg: #dbeafe;
```

**Step 7: Update gradient to subtle gray-blue**

Replace gradient definitions:

```scss
// Gradients (subtle professional)
$gradient-primary: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
$gradient-background: linear-gradient(135deg, #f8f9fa 0%, #e8eef3 100%);
```

**Step 8: Update shadows to soft/subtle**

Replace shadow definitions:

```scss
// Shadows (soft professional)
$shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
```

**Step 9: Verify SCSS compiles**

Run: `npm run build`
Expected: Build succeeds with no SCSS errors

**Step 10: Commit token changes**

```bash
git add src/styles/_tokens.scss
git commit -m "feat: update design tokens to professional dashboard palette"
```

---

## Task 2: Update Typography Hierarchy

Transform typography to bold, clear hierarchy with proper heading weights and colors.

**Files:**
- Modify: `src/components/atoms/Heading/Heading.scss`

**Step 1: Update H1 styles for bold hierarchy**

Replace `.heading--h1` styles:

```scss
&--h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: $color-heading;
  letter-spacing: -0.025em;
  line-height: 1.2;
}
```

**Step 2: Update H2 styles**

Replace `.heading--h2`:

```scss
&--h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: $color-heading;
  line-height: 1.2;
}
```

**Step 3: Update H3 styles**

Replace `.heading--h3`:

```scss
&--h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-heading-secondary;
  line-height: 1.25;
}
```

**Step 4: Update H4 styles**

Replace `.heading--h4`:

```scss
&--h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: $color-heading-secondary;
  line-height: 1.3;
}
```

**Step 5: Remove gradient text effects**

Remove any gradient background-clip styles from headings (if present).

**Step 6: Update base heading color**

Update `.heading` base class:

```scss
.heading {
  color: $color-heading;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
```

**Step 7: Verify in browser**

Start dev server: `npm run dev`
Navigate to configure page
Expected: Headings are darker, bolder, no gradients

**Step 8: Commit typography changes**

```bash
git add src/components/atoms/Heading/Heading.scss
git commit -m "feat: update typography hierarchy to bold professional style"
```

---

## Task 3: Update Card Component Styling

Remove borders, update shadows to soft/elegant, ensure white backgrounds.

**Files:**
- Modify: `src/components/molecules/Card/Card.scss`

**Step 1: Update base card styles**

Replace `.card` base styles:

```scss
.card {
  background-color: $color-background;
  border-radius: 0.75rem;
  border: none;
  transition: all $transition-base;
}
```

**Step 2: Update shadow variant**

Replace `.card--shadow`:

```scss
&--shadow {
  box-shadow: $shadow-sm;
}
```

**Step 3: Update elevated variant**

Replace `.card--elevated`:

```scss
&--elevated {
  box-shadow: $shadow-lg;
}
```

**Step 4: Update hoverable variant**

Replace `.card--hoverable`:

```scss
&--hoverable {
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-xl;
  }
}
```

**Step 5: Remove colored accent variants**

Remove or comment out `.card--accent-top` and `.card--accent-left` (not needed in professional design).

**Step 6: Update padding for spacious design**

Ensure padding variants support `2.5rem` for large:

```scss
&--padding-large {
  padding: 2.5rem;
}
```

**Step 7: Verify in browser**

Refresh page
Expected: Cards are pure white, soft shadows, no borders

**Step 8: Commit card styling**

```bash
git add src/components/molecules/Card/Card.scss
git commit -m "feat: update card styling to borderless elegant design"
```

---

## Task 4: Update Button Component Styling

Remove gradient buttons, update to solid professional blue, refine hover states.

**Files:**
- Modify: `src/components/atoms/Button/Button.scss`

**Step 1: Update primary button to solid blue**

Replace `.btn--primary`:

```scss
&--primary {
  background-color: $color-primary;
  color: white;
  box-shadow: $shadow-xs;

  &:hover:not(:disabled) {
    background-color: $color-primary-dark;
    box-shadow: $shadow-md;
  }
}
```

**Step 2: Remove gradient button variant**

Remove or comment out `.btn--gradient` completely.

**Step 3: Update outlined button colors**

Replace `.btn--outlined`:

```scss
&--outlined {
  background-color: transparent;
  color: $color-heading-secondary;
  border: 2px solid $color-gray-500;
  box-shadow: none;

  &:hover:not(:disabled) {
    background-color: $color-gray-100;
    border-color: $color-gray-600;
  }
}
```

**Step 4: Update text button colors**

Replace `.btn--text`:

```scss
&--text {
  background-color: transparent;
  color: $color-primary;
  box-shadow: none;
  padding: 0.5rem 1rem;

  &:hover:not(:disabled) {
    background-color: $color-primary-lighter;
    box-shadow: none;
    transform: none;
  }
}
```

**Step 5: Update secondary button**

Replace `.btn--secondary`:

```scss
&--secondary {
  background-color: $color-gray-600;
  color: white;
  box-shadow: $shadow-xs;

  &:hover:not(:disabled) {
    background-color: $color-gray-700;
  }
}
```

**Step 6: Update success button**

Replace `.btn--success`:

```scss
&--success {
  background-color: $color-success;
  color: white;
  box-shadow: $shadow-xs;

  &:hover:not(:disabled) {
    background-color: darken($color-success, 10%);
  }
}
```

**Step 7: Update base button styles**

Ensure border-radius is `0.5rem`:

```scss
.btn {
  // ... existing properties
  border-radius: 0.5rem;
}
```

**Step 8: Verify in browser**

Refresh page
Expected: Buttons are solid colors, no gradients, professional appearance

**Step 9: Commit button styling**

```bash
git add src/components/atoms/Button/Button.scss
git commit -m "feat: update buttons to solid professional colors"
```

---

## Task 5: Update Chip Component to Neutral Colors

Remove colorful chips, use neutral grays for professional look.

**Files:**
- Modify: `src/components/atoms/Chip/Chip.scss`

**Step 1: Update default chip to neutral gray**

Replace `.chip--primary`:

```scss
&--primary {
  background: $color-gray-200;
  color: $color-heading-secondary;
}
```

**Step 2: Update secondary chip**

Replace `.chip--secondary`:

```scss
&--secondary {
  background: $color-gray-200;
  color: $color-heading-secondary;
}
```

**Step 3: Update outlined chip**

Replace `.chip--outlined`:

```scss
&--outlined {
  background: transparent;
  border: 1px solid $color-gray-300;
  color: $color-gray-600;
}
```

**Step 4: Keep status chips but make subtle**

Update status colors to match new palette:

```scss
&--success {
  background: $color-success-bg;
  color: $color-success;
}

&--error {
  background: $color-error-bg;
  color: $color-error;
}
```

**Step 5: Verify in browser**

Navigate to setup page
Expected: Chips are neutral gray, not colorful

**Step 6: Commit chip styling**

```bash
git add src/components/atoms/Chip/Chip.scss
git commit -m "feat: update chips to neutral gray professional style"
```

---

## Task 6: Update Form Input Styling

Refine input borders, focus states, and error states to professional design.

**Files:**
- Modify: `src/components/atoms/Select/Select.scss`
- Modify: `src/components/molecules/ConfigList/ConfigList.scss`

**Step 1: Update Select component borders**

In `Select.scss`, replace base styles:

```scss
.select {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid $color-gray-300;
  border-radius: 0.5rem;
  background-color: white;
  font-family: inherit;
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    border-color: $color-gray-400;
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
}
```

**Step 2: Update Select error state**

Replace `.select--error`:

```scss
&--error {
  border-color: $color-error;
  background: $color-error-bg;

  &:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
}
```

**Step 3: Update ConfigList input styling**

In `ConfigList.scss`, replace input styles:

```scss
&__input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid $color-gray-300;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all $transition-base;
  background: $color-background;

  &:hover {
    border-color: $color-gray-400;
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &--error {
    border-color: $color-error;
    background: $color-error-bg;

    &:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
  }
}
```

**Step 4: Verify in browser**

Navigate to configure page, test input focus
Expected: Clean borders, smooth blue focus ring

**Step 5: Commit input styling**

```bash
git add src/components/atoms/Select/Select.scss src/components/molecules/ConfigList/ConfigList.scss
git commit -m "feat: update form inputs to professional styling"
```

---

## Task 7: Update Alert Component Styling

Refine alert colors to match new professional palette.

**Files:**
- Modify: `src/components/molecules/Alert/Alert.scss`

**Step 1: Update alert structure**

Replace base alert styles:

```scss
.alert {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  margin: 1.5rem 0;
  border: 1px solid;
}
```

**Step 2: Update success alert**

Replace `.alert--success`:

```scss
&--success {
  background-color: $color-success-bg;
  color: $color-success;
  border-color: $color-success;
}
```

**Step 3: Update warning alert**

Replace `.alert--warning`:

```scss
&--warning {
  background-color: $color-warning-bg;
  color: $color-warning;
  border-color: $color-warning;
}
```

**Step 4: Update error alert**

Replace `.alert--error`:

```scss
&--error {
  background-color: $color-error-bg;
  color: $color-error;
  border-color: $color-error;
}
```

**Step 5: Update info alert**

Replace `.alert--info`:

```scss
&--info {
  background-color: $color-info-bg;
  color: $color-info;
  border-color: $color-info;
}
```

**Step 6: Verify in browser**

Navigate to winner/eliminated pages
Expected: Alerts have subtle backgrounds with border

**Step 7: Commit alert styling**

```bash
git add src/components/molecules/Alert/Alert.scss
git commit -m "feat: update alert styling to professional palette"
```

---

## Task 8: Update Results Table Styling

Refine table with subtle borders, professional hover states.

**Files:**
- Modify: `src/components/organisms/ResultsTable/ResultsTable.scss`

**Step 1: Update table header**

Replace `.results-table__header`:

```scss
&__header {
  background-color: $color-gray-100;
}
```

**Step 2: Update table cell header styling**

Replace `.results-table__cell--header`:

```scss
&__cell--header {
  font-weight: 600;
  color: $color-heading-secondary;
  text-align: center;
}
```

**Step 3: Update row borders**

Replace `.results-table__row`:

```scss
&__row:not(:last-child) {
  border-bottom: 1px solid $color-gray-200;
}
```

**Step 4: Update row hover state**

Add hover state:

```scss
&__row:hover {
  background-color: $color-primary-lighter;
}
```

**Step 5: Verify in browser**

Navigate to winner page
Expected: Table has subtle gray header, light blue hover

**Step 6: Commit table styling**

```bash
git add src/components/organisms/ResultsTable/ResultsTable.scss
git commit -m "feat: update results table to professional styling"
```

---

## Task 9: Update Page Backgrounds

Transform page backgrounds from vibrant gradients to subtle professional gradients.

**Files:**
- Modify: `src/components/templates/VotingLayout/VotingLayout.scss`
- Modify: `src/pages/Configure/Configure.scss`

**Step 1: Update VotingLayout background**

In `VotingLayout.scss`, replace background:

```scss
.voting-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $gradient-background;
}
```

**Step 2: Update header styling**

Update header background to be more subtle:

```scss
&__header {
  padding: 2rem;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}
```

**Step 3: Update title colors**

Update title to use professional color:

```scss
&__title {
  color: $color-heading;
  font-size: 2rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
```

**Step 4: Update Configure page background**

In `Configure.scss`, replace background:

```scss
.configure-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: $gradient-background;
}
```

**Step 5: Update main content padding**

In `VotingLayout.scss`, ensure spacious padding:

```scss
&__main {
  flex: 1;
  padding: 4rem 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
```

**Step 6: Verify in browser**

Navigate through all pages
Expected: Subtle gray-blue gradient backgrounds

**Step 7: Commit page background changes**

```bash
git add src/components/templates/VotingLayout/VotingLayout.scss src/pages/Configure/Configure.scss
git commit -m "feat: update page backgrounds to subtle professional gradients"
```

---

## Task 10: Add Section Structure to ConfigForm

Add visual section headers with light gray backgrounds for professional structure.

**Files:**
- Modify: `src/components/organisms/ConfigForm/ConfigForm.jsx`
- Modify: `src/components/organisms/ConfigForm/ConfigForm.scss`

**Step 1: Add section wrapper styles**

In `ConfigForm.scss`, add:

```scss
&__section {
  background: $color-surface-secondary;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

&__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: $color-heading-secondary;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
}
```

**Step 2: Update ConfigForm JSX to add section structure**

In `ConfigForm.jsx`, wrap ConfigList components:

```jsx
<div className="config-form__sections">
  <div className="config-form__section">
    <div className="config-form__section-title">Voters</div>
    <ConfigList
      title="Voters"
      items={voters}
      onAdd={handleAddVoter}
      onRemove={handleRemoveVoter}
      placeholder="Enter voter name..."
      maxItems={50}
      minItems={2}
      singularLabel="voter"
      pluralLabel="voters"
    />
  </div>

  <div className="config-form__section">
    <div className="config-form__section-title">Candidates</div>
    <ConfigList
      title="Candidates"
      items={candidates}
      onAdd={handleAddCandidate}
      onRemove={handleRemoveCandidate}
      placeholder="Enter candidate name..."
      maxItems={50}
      minItems={2}
      singularLabel="candidate"
      pluralLabel="candidates"
    />
  </div>
</div>
```

**Step 3: Remove card accent classes**

In `ConfigForm.jsx`, update Card component:

```jsx
<Card className="config-form" padding="large" shadow>
```

Remove `card--accent-top` and `card--elevated` classes.

**Step 4: Verify in browser**

Navigate to configure page
Expected: Light gray section backgrounds with labels

**Step 5: Commit structure changes**

```bash
git add src/components/organisms/ConfigForm/ConfigForm.jsx src/components/organisms/ConfigForm/ConfigForm.scss
git commit -m "feat: add section structure to ConfigForm"
```

---

## Task 11: Add Section Structure to VoterSetupCard

Add visual sections for voters and candidates display.

**Files:**
- Modify: `src/components/organisms/VoterSetupCard/VoterSetupCard.jsx`
- Modify: `src/components/organisms/VoterSetupCard/VoterSetupCard.scss`

**Step 1: Add section styles**

In `VoterSetupCard.scss`, add:

```scss
&__section-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: $color-gray-500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

&__section-content {
  background: $color-surface-secondary;
  padding: 1.25rem;
  border-radius: 0.5rem;
}
```

**Step 2: Update VoterSetupCard JSX**

In `VoterSetupCard.jsx`, add section structure:

```jsx
<section className="voter-setup-card__section" aria-labelledby="voters-heading">
  <div className="voter-setup-card__section-header">
    Voters ({voters.length})
  </div>
  <div className="voter-setup-card__section-content">
    <ChipGroup
      items={voters}
      chipProps={{ variant: 'outlined' }}
    />
  </div>
</section>

<section className="voter-setup-card__section" aria-labelledby="candidates-heading">
  <div className="voter-setup-card__section-header">
    Candidates ({candidates.length})
  </div>
  <div className="voter-setup-card__section-content">
    <ChipGroup
      items={candidates}
      chipProps={{ variant: 'outlined' }}
    />
  </div>
</section>
```

**Step 3: Remove card accent classes**

Update Card component:

```jsx
<Card className="voter-setup-card" padding="large" shadow>
```

**Step 4: Update button variant**

Change button from `gradient` to `primary`:

```jsx
<Button
  onClick={onStart}
  variant="primary"
  size="large"
  fullWidth
  aria-label="Start the voting process with all voters and candidates"
>
  Start Voting
</Button>
```

**Step 5: Verify in browser**

Navigate to setup page
Expected: Structured sections with gray backgrounds

**Step 6: Commit structure changes**

```bash
git add src/components/organisms/VoterSetupCard/VoterSetupCard.jsx src/components/organisms/VoterSetupCard/VoterSetupCard.scss
git commit -m "feat: add section structure to VoterSetupCard"
```

---

## Task 12: Update Remaining Button Variants

Update all remaining buttons from gradient to primary variant.

**Files:**
- Modify: `src/pages/Announce/Announce.jsx`
- Modify: `src/pages/Eliminated/Eliminated.jsx`
- Modify: `src/components/organisms/BallotForm/BallotForm.jsx`

**Step 1: Update Announce page button**

In `Announce.jsx`, change button variant:

```jsx
<Button
  onClick={revealLoserOrWinner}
  variant="primary"
  size="large"
  aria-label={`Reveal ${candidates.length === 2 ? 'the winner' : 'the eliminated candidate'} for this round`}
>
  Reveal
</Button>
```

**Step 2: Remove card elevated class**

Update Card:

```jsx
<Card className="announce__card" padding="large" shadow>
```

**Step 3: Update Eliminated page button**

In `Eliminated.jsx`, change button:

```jsx
<Button
  onClick={handleNextRound}
  variant="primary"
  size="large"
  aria-label={`Proceed to round ${round + 1} of voting`}
>
  Next Round
</Button>
```

**Step 4: Update BallotForm button**

In `BallotForm.jsx`, change button:

```jsx
<Button
  type="submit"
  variant="primary"
  size="large"
  fullWidth
  aria-label={`Submit ballot for ${voterName}`}
>
  Submit Ballot
</Button>
```

**Step 5: Verify in browser**

Test full voting workflow
Expected: All CTAs are solid blue, no gradients

**Step 6: Commit button updates**

```bash
git add src/pages/Announce/Announce.jsx src/pages/Eliminated/Eliminated.jsx src/components/organisms/BallotForm/BallotForm.jsx
git commit -m "feat: update all CTA buttons to solid primary variant"
```

---

## Task 13: Add Title Area Subtitle/Breadcrumb

Add structured title area with subtitle showing current step/phase.

**Files:**
- Modify: `src/components/templates/VotingLayout/VotingLayout.jsx`
- Modify: `src/components/templates/VotingLayout/VotingLayout.scss`

**Step 1: Add subtitle styles**

In `VotingLayout.scss`, add:

```scss
&__header-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 0.75rem;
  display: inline-block;
}

&__subtitle {
  font-size: 0.875rem;
  color: $color-gray-500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.5rem;
  font-weight: 500;
}
```

**Step 2: Update VotingLayout JSX to add subtitle**

In `VotingLayout.jsx`, add subtitle based on current phase:

```jsx
import { useVoting } from '../../../context/votingContext';

export function VotingLayout({ children }) {
  const { state } = useVoting();

  const getPhaseText = () => {
    switch(state.phase) {
      case 'configure': return 'Step 1: Configure Session';
      case 'setup': return 'Step 2: Review Setup';
      case 'voting': return `Step 3: Round ${state.round} Voting`;
      case 'announce': return 'Revealing Results';
      case 'eliminated': return `Round ${state.round} Complete`;
      case 'winner': return 'Final Results';
      default: return '';
    }
  };

  return (
    <div className="voting-layout">
      <header className="voting-layout__header">
        <div className="voting-layout__header-container">
          <h1 className="voting-layout__title">
            <Icon emoji="🗳️" label="ballot box" />
            Ranked-Choice Voting
          </h1>
          {state.phase && (
            <div className="voting-layout__subtitle">
              {getPhaseText()}
            </div>
          )}
        </div>
      </header>
      <main className="voting-layout__main">{children}</main>
    </div>
  );
}
```

**Step 3: Import Icon if not already imported**

Ensure Icon is imported at top of file.

**Step 4: Verify in browser**

Navigate through workflow
Expected: Subtitle shows current step/phase

**Step 5: Commit title area enhancements**

```bash
git add src/components/templates/VotingLayout/VotingLayout.jsx src/components/templates/VotingLayout/VotingLayout.scss
git commit -m "feat: add subtitle breadcrumb to title area"
```

---

## Task 14: Update Global Body Text Color

Ensure body text uses professional near-black color.

**Files:**
- Modify: `src/styles/global.scss`

**Step 1: Update body text color**

In `global.scss`, replace body styles:

```scss
body {
  margin: 0;
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: $line-height-normal;
  color: $color-text-primary;
  background: $color-surface;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Step 2: Verify in browser**

Check all pages
Expected: Text is near-black (#111827), readable

**Step 3: Commit global style update**

```bash
git add src/styles/global.scss
git commit -m "feat: update body text to professional near-black color"
```

---

## Task 15: Final Build Verification

Test production build and verify all changes work correctly.

**Step 1: Run production build**

Run: `npm run build`
Expected: Build completes successfully with no errors

**Step 2: Preview production build**

Run: `npm run preview`
Expected: Server starts successfully

**Step 3: Visual verification checklist**

Open preview URL and verify:
- [ ] Background is subtle gray-blue gradient
- [ ] Cards are pure white with soft shadows, no borders
- [ ] Buttons are solid blue (no gradients)
- [ ] Chips are neutral gray
- [ ] Typography is bold and clear
- [ ] Inputs have professional borders and focus states
- [ ] Section headers have light gray backgrounds
- [ ] Title area shows subtitle/breadcrumb
- [ ] Tables have professional styling
- [ ] Alerts are subtle with borders

**Step 4: Functional verification**

Test complete workflow:
1. Configure voters and candidates
2. Review setup
3. Vote for multiple voters
4. View elimination
5. Continue until winner
6. View results table

Expected: All functionality works unchanged

**Step 5: Commit final verification**

If any issues found, fix them first. Otherwise:

```bash
git add -A
git commit -m "chore: final verification of professional dashboard redesign"
```

**Step 6: Create summary commit**

```bash
git log --oneline | head -15 > redesign-summary.txt
git add redesign-summary.txt
git commit -m "docs: add redesign implementation summary"
```

---

## Implementation Complete

All tasks completed. The app now has a professional dashboard aesthetic with:

✅ Subtle gray-blue gradient backgrounds
✅ Professional color palette (blues and grays)
✅ Bold, clear typography hierarchy
✅ Borderless white cards with soft shadows
✅ Solid color buttons (no gradients)
✅ Neutral gray chips
✅ Structured sections with light backgrounds
✅ Professional form styling
✅ Title area with breadcrumb subtitle
✅ Refined table and alert styling

Next steps:
- User acceptance testing
- Screenshot documentation
- Consider additional polish (animations, micro-interactions)
