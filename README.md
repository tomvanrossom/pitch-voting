# Ranked-Choice Voting

An interactive web application implementing **Borda count elimination** for fair group decision-making. Supports both local single-device voting and multi-device sessions with real-time synchronization.

![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.3.0-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

This application enables teams to conduct ranked-choice voting using a weighted sum elimination algorithm (Borda count). Voters rank all candidates in order of preference, and the system eliminates the worst-performing candidate in each round until a winner emerges.

### Key Features

- **Multi-device voting** - Host creates session, voters join from their phones
- **QR code sharing** - Scan to join instantly
- **Touch-friendly UI** - Tap candidates to rank, animated reordering
- **Real-time sync** - Live ballot tracking with Supabase
- **Joined voters display** - Host sees who has connected
- **Configurable voters and candidates** - Customize participants for each session
- **Multi-round voting system** with progressive elimination
- **Borda count algorithm** for fair vote weighting
- **Visual progress tracking** with stepper component
- **Detailed results table** showing all rounds and scores
- **localStorage persistence** - Resume sessions after page reload
- **Modern CSS architecture** using SCSS + BEM + Design Tokens

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for multi-device mode)

### Installation

1. Clone the repository
```bash
git clone https://github.com/tomvanrossom/pitch-voting.git
cd pitch-voting
```

2. Install dependencies
```bash
npm install
```

3. Configure environment (for multi-device mode)
```bash
cp .env.example .env.local
# Add your Supabase URL and anon key
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## How to Use

### Multi-Device Mode (Recommended)

1. **Host creates session**: Configure voters and candidates, click "Create Session"
2. **Share QR code**: Voters scan the QR code or enter the session code
3. **Voters join**: Each voter selects their name and enters the lobby
4. **Host starts voting**: Once all voters have joined, host starts the round
5. **Tap to rank**: Voters tap candidates in order of preference (chips animate into position)
6. **Real-time tracking**: Host sees who has submitted their ballot
7. **Reveal results**: After all votes are in, host reveals the eliminated candidate
8. **Repeat**: Continue until a winner emerges

### Local Mode

1. **Configure**: Add voters and candidates
2. **Vote in turns**: Pass the device between voters
3. **View results**: See elimination after each round

## Architecture

### State Management
- **Context API + useReducer** for centralized state
- **Supabase Realtime** for multi-device synchronization
- **localStorage persistence** for session recovery

### Project Structure
```
src/
├── styles/
│   ├── _tokens.scss          # Design system tokens
│   ├── _mixins.scss          # Reusable SCSS mixins
│   └── global.scss           # Global base styles
├── components/
│   ├── atoms/                # Button, Chip, Heading, Icon
│   ├── molecules/            # CandidateChip, VoterChip, QRCodeDisplay, ConfigList
│   ├── organisms/            # TapRankBallot, VotingInfoPanel, Stepper
│   └── templates/            # VotingLayout
├── pages/
│   ├── Configure/            # Session configuration
│   ├── HostDashboard/        # Host view with QR code and voter status
│   ├── JoinSession/          # Voter join flow
│   ├── Lobby/                # Waiting room for voters
│   ├── Voting/               # Ballot submission
│   └── Results/              # Final results display
├── context/
│   └── votingContext.jsx     # State management
├── services/
│   ├── sessionService.js     # Supabase session operations
│   └── ballotService.js      # Ballot submission
├── hooks/
│   └── useRealtimeBallots.js # Real-time ballot tracking
├── utils/
│   └── votingUtils.js        # Voting algorithm logic
└── App.jsx                   # Main application router
```

## Voting Algorithm

The app uses **Borda count elimination**:

1. Each voter ranks candidates from best to worst
2. Scores are calculated: 1st place = 1 point, 2nd place = 2 points, etc.
3. The candidate with the **highest total score** (worst ranking) is eliminated
4. Repeat with remaining candidates until a winner emerges

## Technologies

- **React 19.1.0** - UI library
- **Vite 7.3.0** - Build tool and dev server
- **Supabase** - Real-time database and authentication
- **framer-motion** - Layout animations
- **Material UI** - Select components and icons
- **Sass (SCSS)** - CSS preprocessor with BEM methodology
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing

## Database Schema (Supabase)

```sql
-- Sessions table
sessions (
  id uuid PRIMARY KEY,
  code text UNIQUE,          -- 4-character join code
  voters text[],             -- List of voter names
  candidates text[],         -- List of candidates
  joined_voters text[],      -- Voters who have connected
  stage text,                -- setup, voting, results
  round integer,
  host_token text            -- For host authentication
)

-- Ballots table
ballots (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES sessions,
  round integer,
  voter_name text,
  rankings text[]            -- Ordered candidate preferences
)
```

## Contributing

Contributions are welcome! Feel free to:

- Report bugs or issues
- Suggest new features
- Improve documentation
- Submit pull requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with React, Supabase, and modern web practices.
