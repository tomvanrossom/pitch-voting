import React from 'react';
import { Card } from '../../molecules/Card/Card';
import { ChipGroup } from '../../molecules/ChipGroup/ChipGroup';
import { Heading } from '../../atoms/Heading/Heading';
import './VotingInfoPanel.scss';

export function VotingInfoPanel({ remainingCandidates, eliminatedCandidates }) {
  return (
    <Card className="voting-info-panel" padding="medium">
      <section className="voting-info-panel__section" aria-labelledby="remaining-label">
        <Heading level={4} id="remaining-label" className="voting-info-panel__label">
          Remaining:
        </Heading>
        <ChipGroup 
          items={remainingCandidates} 
          chipProps={{ color: 'primary' }}
        />
      </section>
      
      <section className="voting-info-panel__section" aria-labelledby="eliminated-label">
        <Heading level={4} id="eliminated-label" className="voting-info-panel__label">
          Eliminated:
        </Heading>
        {eliminatedCandidates.length === 0 ? (
          <ChipGroup items={['None']} chipProps={{ size: 'small' }} />
        ) : (
          <ChipGroup 
            items={eliminatedCandidates} 
            chipProps={{ color: 'error', size: 'small' }}
          />
        )}
      </section>
    </Card>
  );
}
