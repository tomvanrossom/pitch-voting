import React from 'react';
import { useVoting } from '../../context/votingContext.jsx';
import { Alert } from '../../components/molecules/Alert/Alert';
import { Button } from '../../components/atoms/Button/Button';
import { Heading } from '../../components/atoms/Heading/Heading';
import './EliminatedPage.scss';

export function EliminatedPage() {
  const { state, dispatch } = useVoting();
  const { loser, round } = state;
  
  const handleNextRound = () => dispatch({ type: 'NEXT_ROUND' });

  return (
    <article className="eliminated-page" aria-labelledby="eliminated-heading">
      <Heading level={2} id="eliminated-heading" className="sr-only">
        Round Result
      </Heading>
      <Alert variant="warning">
        Eliminated this round: <strong>{loser}</strong>
      </Alert>
      <Button
        onClick={handleNextRound}
        size="large"
        aria-label={`Proceed to round ${round + 1} of voting`}
      >
        Next Round
      </Button>
    </article>
  );
}
