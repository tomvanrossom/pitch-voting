import React from 'react';
import { useVoting } from '../../context/votingContext.jsx';
import { Card } from '../../components/molecules/Card/Card';
import { Button } from '../../components/atoms/Button/Button';
import { Heading } from '../../components/atoms/Heading/Heading';
import './AnnouncePage.scss';

export function AnnouncePage() {
  const { state, dispatch } = useVoting();
  const { candidates } = state;
  
  const suspenseText = candidates.length === 2
    ? "And the winner is..."
    : "And the loser is...";
  
  const revealLoserOrWinner = () => dispatch({ type: 'REVEAL_RESULT' });

  return (
    <section className="announce-page" aria-labelledby="announce-title">
      <Card className="announce-page__card" padding="large">
        <Heading level={2} id="announce-title" className="announce-page__title">
          {suspenseText}
        </Heading>
        <Button
          onClick={revealLoserOrWinner}
          size="large"
          aria-label={`Reveal ${candidates.length === 2 ? 'the winner' : 'the eliminated candidate'} for this round`}
        >
          Reveal
        </Button>
      </Card>
    </section>
  );
}
