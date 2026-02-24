import React from 'react';
import { useVoting, loadConfig } from '../../context/votingContext.jsx';
import { VoterSetupCard } from '../../components/organisms/VoterSetupCard/VoterSetupCard';
import { Button } from '../../components/atoms/Button/Button';
import { Heading } from '../../components/atoms/Heading/Heading';

export function Setup() {
  const { dispatch } = useVoting();
  const config = loadConfig();

  const startVoting = () => dispatch({ type: 'START_VOTING' });
  const editConfig = () => dispatch({ type: 'GOTO_CONFIGURE' });

  return (
    <section aria-labelledby="setup-heading">
      <Heading level={2} id="setup-heading" className="sr-only">
        Voting Setup
      </Heading>
      <VoterSetupCard
        voters={config.voters}
        candidates={config.candidates}
        onStart={startVoting}
      />
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Button
          onClick={editConfig}
          variant="text"
          aria-label="Go back to edit configuration"
        >
          Edit Configuration
        </Button>
      </div>
    </section>
  );
}
