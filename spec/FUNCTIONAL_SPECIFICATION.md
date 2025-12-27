# Functional Specification: 2025 Pitch Voting System

## 1. Executive Summary

### 1.1 Purpose
The 2025 Pitch Voting System is a web-based application designed to facilitate ranked-choice voting using a weighted Instant-Runoff Voting (IRV) mechanism with Borda count scoring. The system enables a group of voters to collectively select a winning destination/option through multiple elimination rounds.

### 1.2 Target Users
- **Primary Users**: Five team members (Bert, Birger, Dave, Ewoud, Tom) participating in the voting process
- **Use Case**: Team decision-making for selecting a 2025 destination/activity from six options

### 1.3 Core Value Proposition
- Provides fair, transparent ranked-choice voting
- Eliminates weakest options progressively
- Generates complete audit trail of decision process
- Creates engaging, suspenseful voting experience

---

## 2. System Overview

### 2.1 Technical Architecture
- **Framework**: React 19.1.0
- **UI Library**: Material-UI (MUI) 7.1.1
- **Build Tool**: Create React App 5.0.1
- **Runtime**: Client-side Single Page Application (SPA)

### 2.2 Fixed Configuration
- **Voters**: 5 participants (Bert, Birger, Dave, Ewoud, Tom)
- **Options**: 6 candidates (Taghazout, Albanie, Malta, FuerteVentura, Chartreuse (drank), Tunesie)
- **Rounds**: Maximum 5 rounds (eliminating one option per round until winner remains)

---

## 3. Voting Algorithm

### 3.1 Weighted Borda Count Elimination Method

**Algorithm Description:**
The system uses a modified Borda count where candidates are scored based on their ranking position across all ballots, with the **highest** total score being eliminated (worst performer).

**Scoring Rules:**
1. Each voter ranks ALL remaining candidates from 1st to Nth position
2. Score calculation per candidate:
   - 1st place ranking = 1 point
   - 2nd place ranking = 2 points
   - 3rd place ranking = 3 points
   - Nth place ranking = N points
3. Candidate scores are summed across all 5 ballots
4. Candidate with **highest total score** (worst average ranking) is eliminated
5. Process repeats with remaining candidates until one winner remains

**Tiebreaker Logic:**
- If multiple candidates tie for highest score (worst), one is selected randomly

**Example:**
```
Round 1 with 6 candidates, 5 voters:
- Candidate A: positions [1,2,1,3,2] → score = 9
- Candidate B: positions [6,6,6,6,6] → score = 30 (ELIMINATED - highest score)
```

---

## 4. User Workflows

### 4.1 Complete Voting Session Flow

```
┌─────────────┐
│   SETUP     │ → Display voters & candidates → Click "Start Voting"
└─────────────┘
       ↓
┌─────────────┐
│   VOTING    │ → Voter 1 submits ballot → ... → Voter 5 submits ballot
│  (Round 1)  │    (All 5 voters rank all 6 candidates)
└─────────────┘
       ↓
┌─────────────┐
│  ANNOUNCE   │ → "And the loser is..." → Click "Reveal"
└─────────────┘
       ↓
┌─────────────┐
│ ELIMINATED  │ → Show eliminated candidate → Click "Next Round"
└─────────────┘
       ↓
┌─────────────┐
│   VOTING    │ → Repeat for 5 voters ranking 5 remaining candidates
│  (Round 2)  │
└─────────────┘
       ↓
       ... (Continue until 2 candidates remain)
       ↓
┌─────────────┐
│  ANNOUNCE   │ → "And the winner is..." → Click "Reveal"
└─────────────┘
       ↓
┌─────────────┐
│   WINNER    │ → Display winner + complete summary → Click "Restart"
└─────────────┘
```

### 4.2 Individual Ballot Submission Workflow

**User Story**: *As a voter, I want to rank all candidates so that my preferences are recorded.*

1. Voter sees their name displayed prominently: "[Name]'s turn to vote"
2. View remaining candidates and previously eliminated candidates
3. Use dropdown selects to rank candidates from 1st to Nth place
4. System prevents duplicate selections (already-selected candidates disabled in subsequent dropdowns)
5. System validates all positions are filled before submission
6. Click "Submit Ballot"
7. System either:
   - Advances to next voter (if 1-4 ballots collected), OR
   - Advances to "Announce" stage (if all 5 ballots collected)

---

## 5. Functional Requirements

### 5.1 Setup Stage

**FR-1.1 Display Voter List**
- **Description**: Show all 5 voter names as colored chips
- **UI Component**: Chip components with secondary color
- **Data**: VOTERS constant array

**FR-1.2 Display Candidate List**
- **Description**: Show all 6 initial candidates as outlined chips
- **UI Component**: Chip components with primary color, outlined variant
- **Data**: OPTIONS constant array

**FR-1.3 Start Voting Button**
- **Description**: Initialize voting session
- **Action**: Transition to "voting" stage
- **State Reset**: Clear all previous session data (ballots, eliminations, scores)

### 5.2 Voting Stage

**FR-2.1 Voter Identification**
- **Description**: Display current voter's name prominently
- **Format**: "[Voter Name]'s turn to vote" (h4 heading, primary color)

**FR-2.2 Round Progress Stepper**
- **Description**: Visual indicator showing current round and past eliminations
- **Elements**: 
  - Maximum 5 steps (one per potential elimination round)
  - Active step highlights current round
  - Completed steps show eliminated candidate chip
- **Updates**: After each round completion

**FR-2.3 Candidate Status Display**
- **Description**: Show remaining vs eliminated candidates
- **Remaining**: Primary-colored chips
- **Eliminated**: Error-colored chips
- **Layout**: Two separate rows in card component

**FR-2.4 Ballot Form - Ranking Interface**
- **Description**: Interactive form for ranking all remaining candidates
- **Components**: 
  - N dropdown selects (where N = number of remaining candidates)
  - Each labeled "Rank 1", "Rank 2", ..., "Rank N"
  - Placeholder: "Select candidate..."
- **Auto-disable Logic**: Once a candidate is selected at rank X, they are removed from options in ranks X+1 through N
- **Required**: All dropdowns must have a selection

**FR-2.5 Ballot Validation**
- **Rules**:
  1. All ranking positions must be filled (no blanks)
  2. No duplicate candidates allowed
  3. All remaining candidates must be ranked exactly once
- **Error Display**: Alert component with error severity showing validation message
- **Trigger**: On submit attempt with invalid data
- **Clear**: Error clears when user modifies any dropdown

**FR-2.6 Ballot Submission**
- **Action**: Store ballot in round's ballot collection
- **Navigation**: 
  - If voter 1-4: Advance to next voter
  - If voter 5: Advance to "announce" stage
- **State Update**: Increment currentBallot counter

**FR-2.7 Voter Transition**
- **Description**: Sequential ballot collection from all 5 voters
- **Form Reset**: Clear form state when transitioning between voters
- **Counter**: Track current ballot index (0-4)

### 5.3 Announce Stage

**FR-3.1 Suspense Screen**
- **Description**: Build anticipation before revealing result
- **Text Display**: 
  - If 2 candidates remaining: "And the winner is..."
  - Otherwise: "And the loser is..."
- **Interaction**: Single "Reveal" button (large, prominent)
- **State**: Blocking screen - no other actions available

**FR-3.2 Score Calculation**
- **Trigger**: On "Reveal" button click
- **Process**: Execute `weightedFindLoser()` function with current ballots and candidates
- **Algorithm**: Described in Section 3.1
- **Output**: 
  - Loser/winner candidate name
  - Complete score object for all candidates

**FR-3.3 Result Determination**
- **Logic**:
  - If candidates.length === 2: Determine winner (non-eliminated candidate)
  - Otherwise: Determine loser (highest scoring candidate)
- **State Transitions**:
  - Winner scenario: Advance to "winner" stage
  - Loser scenario: Advance to "eliminated" stage
- **History Tracking**: Append scores and eliminated candidate to history arrays

### 5.4 Eliminated Stage

**FR-4.1 Elimination Announcement**
- **Description**: Display which candidate was eliminated this round
- **UI Component**: Warning Alert with candidate name in bold
- **Format**: "Eliminated this round: [Candidate Name]"

**FR-4.2 Next Round Button**
- **Description**: Advance to next elimination round
- **Action**: 
  - Remove eliminated candidate from candidates array
  - Reset ballot collection (empty ballots array, reset counter)
  - Increment round number
  - Transition to "voting" stage
- **Appearance**: Full-width contained button, primary color

### 5.5 Winner Stage

**FR-5.1 Winner Announcement**
- **Description**: Display final winner
- **UI Component**: Success Alert with trophy icon
- **Format**: "Winner: [Candidate Name]"
- **Styling**: Large font size (20px), success severity

**FR-5.2 Complete Voting Summary Table**
- **Description**: Audit trail showing all rounds, eliminations, and scores
- **Columns**:
  - Round number
  - Eliminated candidate (with error-colored chip)
  - Score columns for each of the 6 original candidates
- **Rows**: One per elimination round, plus final winner row
- **Data Display**: 
  - Score values where candidate was still in running
  - "-" for candidates already eliminated in previous rounds
- **Component**: Material-UI Table in scrollable container
- **Winner Row**: Special formatting with "Winner" label and success-colored chip

**FR-5.3 Restart Button**
- **Description**: Reset entire application to setup stage
- **Action**: 
  - Reset all state variables to initial values
  - Clear all history arrays
  - Restore full candidate list
  - Transition to "setup" stage
- **Icon**: Trophy icon
- **Styling**: Full-width, success color, contained variant

### 5.6 Data Persistence

**FR-6.1 History Tracking**
- **Eliminated History**: Array storing eliminated candidate names in order
- **Score History**: Array storing score objects from each round
- **Format**: Each round's score object maps candidate names to numeric scores
- **Purpose**: Enable complete audit trail in final summary

**FR-6.2 Session State**
- **Scope**: Single browser session only
- **Persistence**: None - data lost on page refresh
- **Rationale**: Simple voting sessions that complete in one sitting

---

## 6. Business Rules

### BR-1: Round Progression
- Each round MUST collect ballots from all 5 voters before proceeding
- Voters MUST submit ballots in fixed order (Bert → Birger → Dave → Ewoud → Tom)

### BR-2: Ranking Completeness
- Every ballot MUST rank ALL remaining candidates
- Partial rankings are NOT allowed
- Blank rankings are NOT allowed

### BR-3: Ranking Uniqueness
- Each candidate can appear only once per ballot
- No duplicate rankings allowed

### BR-4: Elimination Rules
- Exactly one candidate eliminated per round (except final round)
- Elimination based on highest weighted score
- Ties broken randomly
- Once eliminated, candidates cannot be reinstated

### BR-5: Winner Determination
- Voting continues until exactly 2 candidates remain
- Final round determines winner (candidate with lower score)
- Winner is the last candidate NOT eliminated

### BR-6: Score Calculation
- Lower ranking position number = better performance
- Scores summed across all ballots
- All ballots weighted equally (no voter has higher influence)

---

## 7. User Interface Specifications

### 7.1 Layout Structure
- **Container**: Maximum width "sm" (600px), centered, padding 24px
- **Responsive**: Single-column layout, mobile-friendly

### 7.2 Color Scheme
- **Primary Actions**: Primary theme color (blue by default)
- **Remaining Candidates**: Primary color chips
- **Eliminated Candidates**: Error color chips (red)
- **Winner**: Success color chips (green)
- **Voters**: Secondary color chips (purple)
- **Warnings**: Warning severity (orange)

### 7.3 Typography
- **Main Title**: Variant h3, center-aligned, bold weight
- **Stage Titles**: Variant h4-h5, primary color
- **Ballot Title**: Variant h5, center-aligned, bold, letter-spacing 1px
- **Body Text**: Default variant
- **Footer**: Caption variant, text-secondary color

### 7.4 Component Specifications

**Card Components**:
- Elevation: 0-2
- Padding: 24px (CardContent)
- Margin bottom: 16-24px

**Buttons**:
- Variant: Contained (primary actions)
- Size: Medium (default) or Large (reveal button)
- Full-width for major actions (start, submit, next, restart)

**Form Controls**:
- Full-width Select dropdowns
- Stack spacing: 16px between elements
- Label positioning: Standard
- Required indicator: Implicit through validation

**Chips**:
- Size: Small (eliminated in stepper, voters)
- Size: Default (candidate displays)
- Variant: Default (filled) or Outlined (initial candidate list)

**Stepper**:
- Alternative label positioning (labels below steps)
- Active step highlighted
- Maximum 5 steps visible

**Table**:
- Size: Small (compact rows)
- Scrollable container: Max height 340px
- Borders: Standard table styling
- Header: Fixed positioning (implicit through MUI Table)

### 7.5 Interactive States

**Dropdowns**:
- Default: Light gray background
- Hover: Slightly darker background
- Open: Dropdown menu appears
- Selected: Primary color outline
- Error: Red outline when validation fails
- Disabled: Grayed out options already selected

**Buttons**:
- Default: Solid color
- Hover: Slightly darker shade
- Active/Click: Further darkened
- Disabled: Grayed out (not used in current implementation)

**Alerts**:
- Error: Red background, error icon
- Warning: Orange background, warning icon
- Success: Green background, trophy icon

---

## 8. Data Model

### 8.1 State Variables

```javascript
// Stage Management
stage: string  // "setup" | "voting" | "announce" | "eliminated" | "winner"

// Round Management
round: number  // Current round number (1 to 5)
currentBallot: number  // Current voter index (0 to 4)

// Candidate Management
candidates: string[]  // Array of remaining candidate names
eliminatedHistory: string[]  // Array of eliminated candidates in order

// Ballot Management
ballots: string[][]  // Array of ranking arrays for current round
// Example: [["Malta", "Albanie", ...], ["Taghazout", "Malta", ...], ...]

// Scoring & Results
scoreHistory: object[]  // Array of score objects per round
// Example: [{Malta: 15, Albanie: 18, ...}, {...}]
loser: string | null  // Currently eliminated candidate
winner: string | null  // Final winner

// UI State
pendingAnnouncement: boolean  // Controls suspense display
```

### 8.2 Constants

```javascript
VOTERS: string[]  // ["Bert", "Birger", "Dave", "Ewoud", "Tom"]
OPTIONS: string[]  // ["Taghazout", "Albanie", "Malta", "FuerteVentura", "Chartreuse (drank)", "Tunesie"]
```

### 8.3 Derived Data

```javascript
// History array for table display
historyArr: Array<{
  round: number,
  eliminated: string,
  score: object
}>
// Generated from eliminatedHistory + scoreHistory
```

---

## 9. Validation Rules

### 9.1 Ballot Validation

**V-1: All Positions Filled**
- **Rule**: rankings.length === candidates.length
- **Rule**: No empty strings in rankings array
- **Error**: "Please rank all candidates, with no blanks or duplicates."

**V-2: No Duplicates**
- **Rule**: new Set(rankings).size === rankings.length
- **Implementation**: Check if any value appears more than once
- **Error**: "Each candidate must be ranked exactly once (no duplicates)."

**V-3: All Candidates Ranked**
- **Rule**: Every candidate in candidates array must appear exactly once in rankings
- **Error**: "Please rank all candidates, with no blanks or duplicates."

### 9.2 State Transition Validation

**V-4: Minimum Voters**
- **Rule**: Must collect exactly 5 ballots before round conclusion
- **Implementation**: currentBallot < 4 → next voter, currentBallot === 4 → announce

**V-5: Minimum Candidates**
- **Rule**: Voting continues while candidates.length > 1
- **Implementation**: When candidates.length === 2, winner determined

---

## 10. Algorithms

### 10.1 Weighted Loser Finder

```javascript
function weightedFindLoser(ballots, candidates)
  
Input:
  - ballots: Array of string arrays (rankings from all voters)
  - candidates: Array of candidate names still in running
  
Output:
  - { loser: string, score: object }

Algorithm:
1. Initialize score object with all candidates set to 0
2. For each ballot:
   a. For each candidate in that ballot (with index):
      - If candidate is in remaining candidates:
        - Add (index + 1) to candidate's score
3. Find maximum score value
4. Filter candidates with max score (potential losers)
5. If one loser: return that candidate
   If multiple: return random selection from losers
6. Return loser and complete score object
```

**Complexity**: O(V × C) where V = voters (5), C = candidates (2-6)

### 10.2 Tie Breaking
- **Method**: Random selection
- **Implementation**: `Math.floor(Math.random() * losers.length)`
- **Note**: Non-deterministic behavior when ties occur

---

## 11. Edge Cases & Error Handling

### 11.1 User Input Edge Cases

**E-1: Rapid Form Submission**
- **Scenario**: User clicks submit multiple times quickly
- **Handling**: Form validation occurs each time; state updates synchronously

**E-2: Browser Back Button**
- **Scenario**: User navigates backward in browser history
- **Handling**: Not explicitly handled; may cause unexpected state

**E-3: Page Refresh**
- **Scenario**: User refreshes browser during voting
- **Impact**: All session data lost, returns to setup stage

### 11.2 Data Edge Cases

**E-4: Score Ties**
- **Scenario**: Multiple candidates have identical worst scores
- **Handling**: Random selection breaks tie

**E-5: All Candidates Ranked Identically**
- **Scenario**: All voters submit identical rankings
- **Handling**: Still calculates scores normally; first and last place still evident

---

## 12. Non-Functional Requirements

### 12.1 Performance
- **Initial Load**: < 2 seconds on standard broadband
- **Interaction Response**: Immediate (< 100ms) for all button clicks
- **Calculation Time**: Score calculation < 50ms for 5 voters and 6 candidates

### 12.2 Usability
- **Learning Curve**: First-time users can complete voting within 5 minutes
- **Error Recovery**: Clear error messages guide users to correct input
- **Accessibility**: Basic keyboard navigation supported (MUI standard)

### 12.3 Compatibility
- **Browsers**: Modern browsers supporting React 19 (Chrome, Firefox, Safari, Edge)
- **Devices**: Desktop and mobile responsive (minimum 360px width)
- **Screen Readers**: Partial support through MUI ARIA attributes

### 12.4 Scalability
- **Fixed Scale**: Designed for exactly 5 voters and 6 candidates
- **Not Scalable**: Hardcoded arrays, not designed for variable voter/candidate counts

---

## 13. Acceptance Criteria

### 13.1 Setup Stage
- [ ] AC-1.1: All 5 voter names displayed as chips
- [ ] AC-1.2: All 6 candidate names displayed as chips
- [ ] AC-1.3: "Start Voting" button visible and functional
- [ ] AC-1.4: Clicking "Start Voting" transitions to voting stage

### 13.2 Voting Stage
- [ ] AC-2.1: Current voter's name prominently displayed
- [ ] AC-2.2: Round stepper shows current round
- [ ] AC-2.3: Remaining candidates displayed in card
- [ ] AC-2.4: Eliminated candidates displayed separately (or "None" if round 1)
- [ ] AC-2.5: Ballot form contains N dropdowns for N candidates
- [ ] AC-2.6: Dropdowns prevent duplicate selections
- [ ] AC-2.7: Cannot select same candidate in multiple positions
- [ ] AC-2.8: Submit button submits valid ballot
- [ ] AC-2.9: Error message displays for invalid ballots
- [ ] AC-2.10: After voter 1-4 submission, advances to next voter
- [ ] AC-2.11: After voter 5 submission, advances to announce stage
- [ ] AC-2.12: Form resets when changing voters

### 13.3 Announce Stage
- [ ] AC-3.1: Suspense text displays ("And the loser/winner is...")
- [ ] AC-3.2: "Reveal" button visible and functional
- [ ] AC-3.3: Clicking "Reveal" calculates scores
- [ ] AC-3.4: Clicking "Reveal" transitions to eliminated or winner stage

### 13.4 Eliminated Stage
- [ ] AC-4.1: Eliminated candidate name displayed in alert
- [ ] AC-4.2: "Next Round" button visible
- [ ] AC-4.3: Clicking "Next Round" removes candidate from remaining
- [ ] AC-4.4: Clicking "Next Round" transitions to voting stage with N-1 candidates
- [ ] AC-4.5: Round number increments

### 13.5 Winner Stage
- [ ] AC-5.1: Winner name displayed in success alert with trophy icon
- [ ] AC-5.2: Summary table displays all rounds
- [ ] AC-5.3: Table shows round number for each elimination
- [ ] AC-5.4: Table shows eliminated candidate per round
- [ ] AC-5.5: Table shows scores for all original candidates
- [ ] AC-5.6: Table shows "-" for eliminated candidates in subsequent rounds
- [ ] AC-5.7: Final row shows winner with success chip
- [ ] AC-5.8: "Restart" button visible
- [ ] AC-5.9: Clicking "Restart" returns to setup stage
- [ ] AC-5.10: All state cleared after restart

### 13.6 Algorithm Verification
- [ ] AC-6.1: Scores calculated correctly (position-based weighting)
- [ ] AC-6.2: Highest score candidate eliminated
- [ ] AC-6.3: Ties broken randomly
- [ ] AC-6.4: Final two candidates trigger winner determination
- [ ] AC-6.5: Winner is candidate with lower score in final round

### 13.7 Validation
- [ ] AC-7.1: Cannot submit ballot with blank rankings
- [ ] AC-7.2: Cannot submit ballot with duplicate candidates
- [ ] AC-7.3: Error message clears when user modifies form
- [ ] AC-7.4: All candidates must be ranked

---

## 14. Future Enhancements (Out of Scope)

### 14.1 Potential Features
- **Variable Voters**: Configurable number of voters
- **Variable Candidates**: Configurable candidate list
- **Partial Rankings**: Allow voters to rank only top N choices
- **Data Export**: Download results as CSV/PDF
- **Session Persistence**: Save voting progress to localStorage
- **Authentication**: Prevent voters from seeing others' ballots
- **Remote Voting**: Collect ballots asynchronously from different devices
- **Alternative Algorithms**: Support true IRV (lowest first-preference elimination)
- **Real-time Updates**: WebSocket for multi-device synchronization
- **Voting History**: Store past election results
- **Configurable UI**: Theming options, language selection

### 14.2 Technical Debt
- **Testing**: Add comprehensive unit and integration tests
- **Accessibility**: Full WCAG 2.1 AA compliance
- **Error Boundaries**: React error boundaries for graceful failures
- **Code Splitting**: Lazy loading for better performance
- **TypeScript**: Type safety throughout application
- **Storybook**: Component documentation and visual testing

---

## 15. Appendices

### 15.1 Glossary
- **Ballot**: A single voter's complete ranking of all candidates
- **Borda Count**: Electoral method using ranked preferences with point values
- **IRV (Instant-Runoff Voting)**: Electoral system eliminating lowest-performing candidates
- **Round**: One complete cycle of voting from all 5 voters
- **Weighted Score**: Sum of position-based points for a candidate

### 15.2 Example Voting Scenario

**Initial State**: 6 candidates, 5 voters

**Round 1 Ballots**:
```
Bert:    [Taghazout, Malta, Albanie, FuerteVentura, Tunesie, Chartreuse]
Birger:  [Malta, Taghazout, FuerteVentura, Albanie, Tunesie, Chartreuse]
Dave:    [Taghazout, FuerteVentura, Malta, Albanie, Tunesie, Chartreuse]
Ewoud:   [FuerteVentura, Malta, Taghazout, Albanie, Tunesie, Chartreuse]
Tom:     [Malta, Taghazout, Albanie, FuerteVentura, Tunesie, Chartreuse]
```

**Round 1 Scores**:
```
Taghazout: 1+2+1+3+2 = 9
Malta: 2+1+3+2+1 = 9
FuerteVentura: 4+3+2+1+4 = 14
Albanie: 3+4+4+4+3 = 18
Tunesie: 5+5+5+5+5 = 25
Chartreuse: 6+6+6+6+6 = 30  ← ELIMINATED (highest score)
```

**Round 2**: Repeat with 5 remaining candidates...

(Continue until winner determined)

### 15.3 References
- React Documentation: https://react.dev/
- Material-UI Documentation: https://mui.com/
- Borda Count Method: https://en.wikipedia.org/wiki/Borda_count
- Instant-Runoff Voting: https://en.wikipedia.org/wiki/Instant-runoff_voting

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-27  
**Author**: System Analysis  
**Status**: Final
