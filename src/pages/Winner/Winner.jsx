import React from 'react';
import { useVoting } from '../../context/votingContext.jsx';
import { Alert } from '../../components/molecules/Alert/Alert';
import { Heading } from '../../components/atoms/Heading/Heading';
import { Icon } from '../../components/atoms/Icon/Icon';
import { ResultsTable } from '../../components/organisms/ResultsTable/ResultsTable';
import './Winner.scss';

export function Winner() {
  const { state } = useVoting();
  const { winner, eliminatedHistory, scoreHistory, candidates } = state;

  const historyArr = eliminatedHistory.map((el, idx) => ({
    round: idx + 1,
    eliminated: el,
    score: scoreHistory[idx],
  }));

  return (
    <article className="winner" aria-labelledby="winner-heading">
      <Heading level={2} id="winner-heading" className="sr-only">
        Final Results
      </Heading>

      <Alert variant="success">
        <Icon emoji="🏆" label="trophy" /> <strong>Winner: {winner}</strong>
      </Alert>

      <section className="winner__summary" aria-labelledby="summary-title">
        <Heading level={3} id="summary-title" className="winner__summary-title">
          Voting summary (elimination order and weighted scores)
        </Heading>
        <ResultsTable
          historyData={historyArr}
          allOptions={candidates}
          winner={winner}
        />
      </section>
    </article>
  );
}
