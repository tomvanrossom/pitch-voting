import React from 'react';
import { useVoting, OPTIONS } from '../../context/votingContext.jsx';
import { Alert } from '../../components/molecules/Alert/Alert';
import { Button } from '../../components/atoms/Button/Button';
import { Heading } from '../../components/atoms/Heading/Heading';
import { Icon } from '../../components/atoms/Icon/Icon';
import { ResultsTable } from '../../components/organisms/ResultsTable/ResultsTable';
import './WinnerPage.scss';

export function WinnerPage() {
  const { state, dispatch } = useVoting();
  const { winner, eliminatedHistory, scoreHistory } = state;
  
  const historyArr = eliminatedHistory.map((el, idx) => ({
    round: idx + 1,
    eliminated: el,
    score: scoreHistory[idx],
  }));
  
  const handleReset = () => dispatch({ type: 'RESET' });

  return (
    <article className="winner-page" aria-labelledby="winner-heading">
      <Heading level={2} id="winner-heading" className="sr-only">
        Final Results
      </Heading>
      
      <Alert variant="success">
        <Icon emoji="🏆" label="trophy" /> <strong>Winner: {winner}</strong>
      </Alert>
      
      <section className="winner-page__summary" aria-labelledby="summary-title">
        <Heading level={3} id="summary-title" className="winner-page__summary-title">
          Voting summary (elimination order and weighted scores)
        </Heading>
        <ResultsTable
          historyData={historyArr}
          allOptions={OPTIONS}
          winner={winner}
        />
      </section>

      <Button
        onClick={handleReset}
        variant="success"
        size="large"
        aria-label="Restart the voting process from the beginning"
      >
        <Icon emoji="🏆" label="trophy" /> Restart
      </Button>
    </article>
  );
}
