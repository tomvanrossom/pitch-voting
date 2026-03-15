import React from 'react';
import { Card } from '../../molecules/Card/Card';
import { ChipGroup } from '../../molecules/ChipGroup/ChipGroup';
import { Heading } from '../../atoms/Heading/Heading';
import './VotingInfoPanel.scss';

export function VotingInfoPanel({ eliminatedCandidates }) {
  return (
    <Card className="voting-info-panel" padding="medium">
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
