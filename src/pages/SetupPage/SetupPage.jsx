import React from 'react';
import { useVoting, VOTERS, OPTIONS } from '../../context/votingContext.jsx';
import { VoterSetupCard } from '../../components/organisms/VoterSetupCard/VoterSetupCard';
import { Heading } from '../../components/atoms/Heading/Heading';

export function SetupPage() {
  const { dispatch } = useVoting();
  
  const startVoting = () => dispatch({ type: 'START_VOTING' });

  return (
    <section aria-labelledby="setup-heading">
      <Heading level={2} id="setup-heading" className="sr-only">
        Voting Setup
      </Heading>
      <VoterSetupCard
        voters={VOTERS}
        candidates={OPTIONS}
        onStart={startVoting}
      />
    </section>
  );
}
