import React from 'react';
import { Heading } from '../../atoms/Heading/Heading';
import { Icon } from '../../atoms/Icon/Icon';
import './VotingLayout.scss';

export function VotingLayout({ children, stageInfo }) {
  return (
    <div className="voting-layout">
      <header className="voting-layout__header">
        <Heading level={1} className="voting-layout__title">
          <Icon emoji="🗳️" label="voting ballot" size="large" />
          {' '}2025 Pitch Voting
        </Heading>
      </header>

      <main id="main-content" role="main" className="voting-layout__main">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {stageInfo}
        </div>
        {children}
      </main>

      <footer className="voting-layout__footer">
        <p>&copy; {new Date().getFullYear()} 2025 Pitch Voting - Built with React & SCSS</p>
      </footer>
    </div>
  );
}
