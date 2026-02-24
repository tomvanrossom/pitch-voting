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
        <div className="voter-setup-card__section-header">Voters</div>
        <div className="voter-setup-card__section-content">
          <ChipGroup
            items={voters}
            chipProps={{ color: 'secondary' }}
          />
        </div>
      </section>

      <section className="voter-setup-card__section" aria-labelledby="candidates-heading">
        <div className="voter-setup-card__section-header">Candidates</div>
        <div className="voter-setup-card__section-content">
          <ChipGroup
            items={candidates}
            chipProps={{ color: 'primary', variant: 'outlined', size: 'small' }}
          />
        </div>
      </section>
      
      <Button
        onClick={onStart}
        variant="primary"
        size="large"
        fullWidth
        aria-label="Start the voting process with all voters and candidates"
      >
        Start Voting
      </Button>
    </Card>
  );
}
