import React from 'react';
import { useVoting } from '../../../context/votingContext';
import { Heading } from '../../atoms/Heading/Heading';
import { Icon } from '../../atoms/Icon/Icon';
import './VotingLayout.scss';

export function VotingLayout({ children, stageInfo }) {
  const { state, dispatch } = useVoting();

  const handleReset = (e) => {
    e.preventDefault();
    if (window.confirm('Reset session? This will clear all data.')) {
      dispatch({ type: 'RESET' });
    }
  };

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
          <Heading level={1} className="voting-layout__title">
            <Icon emoji="🗳️" label="voting ballot" size="large" />
            {' '}Ranked Choice Voting
          </Heading>
          {state.phase && (
            <div className="voting-layout__subtitle">
              {getPhaseText()}
            </div>
          )}
        </div>
      </header>

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
