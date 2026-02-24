# 🗳️ Ranked-Choice Voting

An interactive web application implementing **Borda count elimination** method for fair group decision-making. Built as a learning project focused on modern web development practices and CSS architecture.

![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.3.0-646CFF?logo=vite)
![SCSS](https://img.shields.io/badge/SCSS-BEM-pink?logo=sass)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Overview

This application enables teams to conduct ranked-choice voting using a weighted sum elimination algorithm (Borda count). Voters rank all candidates in order of preference, and the system eliminates the worst-performing candidate in each round until a winner emerges.

### Key Features

- **Configurable voters and candidates** - Customize participants for each voting session
- **Multi-round voting system** with progressive elimination
- **Borda count algorithm** for fair vote weighting
- **Interactive ballot forms** with duplicate prevention
- **Visual progress tracking** with stepper component
- **Detailed results table** showing all rounds and scores
- **Suspense reveals** for engagement
- **localStorage persistence** - Resume voting sessions after page reload
- **Modern CSS architecture** using SCSS + BEM + Design Tokens
- **Atomic Design pattern** - Scalable component architecture

## 🎯 Project Goals

This project serves as a **learning platform** for:

- Modern React patterns (Hooks, Context API, useReducer)
- CSS layout techniques (Flexbox, Grid)
- SCSS architecture and BEM methodology
- Design system implementation with tokens
- State management patterns
- Test-driven development

## 🏗️ Architecture

### State Management
- **Context API + useReducer** for centralized state
- Action-based state updates (UPDATE_CONFIG, START_VOTING, SUBMIT_BALLOT, REVEAL_RESULT, etc.)
- **localStorage persistence** - Configuration and voting state automatically saved
- Business logic separated from UI components

### CSS Architecture
- **Design Tokens** (`_tokens.scss`) - Colors, spacing, typography, shadows
- **Mixins Library** (`_mixins.scss`) - Reusable patterns (flexbox helpers, card patterns, button styles)
- **Component-based SCSS** - Each component has its own scoped styles
- **BEM naming convention** - `.block__element--modifier` pattern
- **No CSS frameworks** - Hand-written layouts using Flexbox and Grid

### Project Structure
```
src/
├── styles/
│   ├── _tokens.scss          # Design system tokens
│   ├── _mixins.scss          # Reusable SCSS mixins
│   └── global.scss           # Global base styles
├── components/
│   ├── atoms/                # Atomic Design - Atoms
│   │   ├── Button/           # Button component
│   │   ├── Chip/             # Removable badge component
│   │   ├── Heading/          # Heading component
│   │   └── Stepper/          # Progress stepper
│   ├── molecules/            # Atomic Design - Molecules
│   │   ├── BallotForm/       # Voting form component
│   │   ├── ChipGroup/        # Group of chips
│   │   └── ConfigList/       # List with add/remove
│   ├── organisms/            # Atomic Design - Organisms
│   │   └── ConfigForm/       # Complete configuration form
│   └── pages/                # Page-level components
│       ├── Configure.jsx     # Configuration page
│       ├── Setup.jsx         # Setup review page
│       ├── VotingPage.jsx    # Voting rounds page
│       └── ResultsPage.jsx   # Results page
├── context/
│   └── votingContext.jsx     # State management (Context + Reducer)
├── utils/
│   └── votingUtils.js        # Voting algorithm logic
├── App.jsx                   # Main application router
└── main.jsx                  # App entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ranked-choice-voting.git
cd ranked-choice-voting
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎮 How to Use

1. **Configure Phase**: Add voters and candidates for your voting session
   - Add voters one at a time (press Enter or click "Add Voter")
   - Add candidates to vote on (press Enter or click "Add Candidate")
   - Remove items by clicking the × button on any chip
   - Min: 2 voters, 2 candidates | Max: 50 voters, 20 candidates
2. **Setup Phase**: Review your configuration before starting
   - Edit configuration if needed by clicking "Edit Configuration"
3. **Voting Rounds**: Each voter ranks all remaining candidates
   - Voters submit ballots one at a time
   - All candidates must be ranked (no ties allowed)
4. **Elimination**: After each round, the lowest-scoring candidate is eliminated
5. **Winner Declaration**: Process continues until only one candidate remains
6. **Results Summary**: View detailed scoring history for all rounds
7. **Persistence**: Your configuration and voting progress is automatically saved
   - Close and reopen the browser to resume where you left off

## 🧮 Voting Algorithm

The app uses **Borda count elimination**:

1. Each voter ranks candidates from best to worst (1st place, 2nd place, etc.)
2. Scores are calculated: 1st place = 1 point, 2nd place = 2 points, etc.
3. The candidate with the **highest total score** (worst ranking) is eliminated
4. Repeat with remaining candidates until a winner emerges

This method ensures majority preferences are respected while avoiding issues like vote splitting.

## 🎨 CSS Learning Features

This project demonstrates modern CSS techniques:

### Flexbox Examples
- **Card layouts**: `display: flex; gap: 1rem;`
- **Centered content**: `justify-content: center; align-items: center;`
- **Form fields**: `flex-direction: column;`

### Grid Examples
- **Stepper component**: `grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));`
- **Responsive table**: Overflow handling with grid

### BEM Naming
```scss
.ballot-form { }                    // Block
.ballot-form__title { }             // Element
.ballot-form__select--error { }     // Modifier
```

### Design Tokens
```scss
$color-primary: #1976d2;
$spacing-md: 1.5rem;
$font-size-xl: 1.25rem;
$shadow-sm: 0px 2px 1px -1px rgba(0,0,0,0.2);
```

## 📚 Documentation

- [CSS Migration Summary](./CSS_MIGRATION_SUMMARY.md) - Detailed CSS architecture documentation
- [Design Tokens](./ src/styles/_tokens.scss) - Complete token reference
- [Mixins Library](./src/styles/_mixins.scss) - Reusable SCSS patterns

## 🛠️ Technologies

- **React 19.1.0** - UI library
- **Vite 7.3.0** - Modern build tool and dev server
- **Sass (SCSS)** - CSS preprocessor
- **Context API + useReducer** - State management
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing

## 🎓 Learning Resources

If you're using this project to learn, explore:

1. **State Management**: `src/context/votingContext.jsx` - See reducer pattern in action
2. **Atomic Design**: `src/components/` - Atoms, molecules, organisms architecture
3. **localStorage Persistence**: `votingContext.jsx` - Auto-save config and voting state
4. **CSS Architecture**: `src/styles/` - Study token system and mixins
5. **BEM Methodology**: All `.scss` files - Consistent naming patterns
6. **Flexbox**: Component layouts - Various flex patterns
7. **Form Validation**: `ConfigList.jsx` - Input validation and error handling
8. **Component Composition**: `ChipGroup.jsx` - Reusable component patterns

## 🤝 Contributing

This is a learning project, but contributions are welcome! Feel free to:

- Report bugs or issues
- Suggest new features
- Improve documentation
- Submit pull requests

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- Borda count voting method for fair elimination
- React community for excellent documentation
- SCSS/BEM best practices from CSS architecture guides

## 📧 Contact

For questions or feedback about this learning project, please open an issue on GitHub.

---

**Note**: This project uses [Vite](https://vite.dev/) for lightning-fast development and optimized production builds, with modern CSS architecture and state management patterns for educational purposes.
