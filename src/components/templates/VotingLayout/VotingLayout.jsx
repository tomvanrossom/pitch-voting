import React from 'react';
import { useVoting } from '../../../context/votingContext';
import './VotingLayout.scss';

export function VotingLayout({ children, stageInfo }) {
  const { state, dispatch } = useVoting();

  const handleReset = (e) => {
    e.preventDefault();
    if (window.confirm('Reset session? This will clear all data.')) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <div className="voting-layout">
      <main id="main-content" role="main" className="voting-layout__main">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {stageInfo}
        </div>
        {children}
      </main>

      <footer className="voting-layout__footer">
        <p>
          &copy; {new Date().getFullYear()} Ranked Choice Voting
          {' | '}
          <a href="#" onClick={handleReset} style={{ color: 'inherit' }}>Reset Session</a>
        </p>
      </footer>
    </div>
  );
}
