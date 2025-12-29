import React from 'react';
import { Card } from '../../molecules/Card/Card';
import { ChipGroup } from '../../molecules/ChipGroup/ChipGroup';
import { Button } from '../../atoms/Button/Button';
import { Heading } from '../../atoms/Heading/Heading';
import './VoterSetupCard.scss';

export function VoterSetupCard({ voters, candidates, onStart }) {
  return (
    <Card className="voter-setup-card" padding="large">
      <section className="voter-setup-card__section" aria-labelledby="voters-heading">
        <Heading level={3} id="voters-heading">
          Voters
        </Heading>
        <ChipGroup 
          items={voters} 
          chipProps={{ color: 'secondary' }}
        />
      </section>
      
      <section className="voter-setup-card__section" aria-labelledby="candidates-heading">
        <Heading level={3} id="candidates-heading" className="sr-only">
          Candidates
        </Heading>
        <p><strong>Candidates:</strong></p>
        <ChipGroup 
          items={candidates} 
          chipProps={{ color: 'primary', variant: 'outlined', size: 'small' }}
        />
      </section>
      
      <Button
        onClick={onStart}
        size="large"
        fullWidth
        aria-label="Start the voting process with all voters and candidates"
      >
        Start Voting
      </Button>
    </Card>
  );
}
