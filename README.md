# 🗳️ Ranked-Choice Voting

An interactive web application implementing **Borda count elimination** method for fair group decision-making. Built as a learning project focused on modern web development practices and CSS architecture.

![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![SCSS](https://img.shields.io/badge/SCSS-BEM-pink?logo=sass)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Overview

This application enables teams to conduct ranked-choice voting using a weighted sum elimination algorithm (Borda count). Voters rank all candidates in order of preference, and the system eliminates the worst-performing candidate in each round until a winner emerges.

### Key Features

- **Multi-round voting system** with progressive elimination
- **Borda count algorithm** for fair vote weighting
- **Interactive ballot forms** with duplicate prevention
- **Visual progress tracking** with stepper component
- **Detailed results table** showing all rounds and scores
- **Suspense reveals** for engagement
- **Modern CSS architecture** using SCSS + BEM + Design Tokens

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
- Action-based state updates (START_VOTING, SUBMIT_BALLOT, REVEAL_RESULT, etc.)
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
│   ├── _tokens.scss       # Design system tokens
│   ├── _mixins.scss       # Reusable SCSS mixins
│   └── global.scss        # Global base styles
├── components/
│   ├── BallotForm.js      # Voting form component
│   ├── BallotForm.scss    # Ballot form styles
│   ├── Chip.js            # Reusable badge component
│   └── Chip.scss          # Chip styles
├── App.js                 # Main application component
├── App.scss               # Main app styles (BEM)
├── votingContext.js       # State management (Context + Reducer)
└── index.js               # App entry point
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
npm start
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

## 🎮 How to Use

1. **Setup Phase**: Review voters and candidates
2. **Voting Rounds**: Each voter ranks all remaining candidates
3. **Elimination**: After each round, the lowest-scoring candidate is eliminated
4. **Winner Declaration**: Process continues until only one candidate remains
5. **Results Summary**: View detailed scoring history for all rounds

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
- **Sass (SCSS)** - CSS preprocessor
- **Context API + useReducer** - State management
- **React Testing Library** - Component testing
- **Create React App** - Build tooling

## 🎓 Learning Resources

If you're using this project to learn, explore:

1. **State Management**: `votingContext.js` - See reducer pattern in action
2. **CSS Architecture**: `src/styles/` - Study token system and mixins
3. **BEM Methodology**: All `.scss` files - Consistent naming patterns
4. **Flexbox**: `App.scss` - Various flex layouts
5. **Grid**: `.stepper` class - Responsive grid example
6. **Component Design**: `BallotForm.js` - Form validation and state

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

**Note**: This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and has been enhanced with modern CSS architecture and state management patterns for educational purposes.
