import React, { useState, useEffect, useRef } from 'react';
import { Collapse } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useVoting } from '../../context/votingContext.jsx';
import { Alert } from '../../components/molecules/Alert/Alert';
import { Heading } from '../../components/atoms/Heading/Heading';
import { Icon } from '../../components/atoms/Icon/Icon';
import { ResultsTable } from '../../components/organisms/ResultsTable/ResultsTable';
import './Winner.scss';

export function Winner() {
  const { t } = useTranslation();
  const { state } = useVoting();
  const { winner, eliminatedHistory, scoreHistory, candidates, session } = state;
  const [expanded, setExpanded] = useState(false);
  const headingRef = useRef(null);

  // Focus heading on mount for screen reader announcement
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Use original candidates list from session, or reconstruct from eliminated + current
  const allCandidates = session?.candidates || [...new Set([...eliminatedHistory, ...candidates])];

  const historyArr = eliminatedHistory.map((el, idx) => ({
    round: idx + 1,
    eliminated: el,
    score: scoreHistory[idx],
  }));

  const handleToggle = () => setExpanded(!expanded);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <article className="winner" aria-labelledby="winner-heading">
      <Heading level={2} id="winner-heading" className="sr-only" ref={headingRef} tabIndex={-1}>
        {t('winner.finalResults')}
      </Heading>

      <Alert variant="success">
        <Icon emoji="🏆" label="trophy" /> <strong>{t('winner.theWinnerIs')} {winner}</strong>
      </Alert>

      <section className="winner__summary" aria-labelledby="summary-title">
        <button
          type="button"
          className="winner__summary-toggle"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={expanded}
          aria-controls="results-table"
        >
          <Heading level={3} id="summary-title" className="winner__summary-title">
            {t('winner.votingSummary')}
          </Heading>
          <span className={`winner__summary-icon ${expanded ? 'winner__summary-icon--expanded' : ''}`}>
            ▼
          </span>
        </button>
        <Collapse in={expanded}>
          <div id="results-table">
            <ResultsTable
              historyData={historyArr}
              allOptions={allCandidates}
              winner={winner}
            />
          </div>
        </Collapse>
      </section>
    </article>
  );
}
