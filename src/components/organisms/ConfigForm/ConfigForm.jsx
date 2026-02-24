import React from 'react';
import { Card } from '../../molecules/Card/Card';
import { ConfigList } from '../../molecules/ConfigList/ConfigList';
import { Button } from '../../atoms/Button/Button';
import { Heading } from '../../atoms/Heading/Heading';
import './ConfigForm.scss';

export function ConfigForm({ voters, candidates, onUpdateVoters, onUpdateCandidates, onContinue }) {
  const isValid = voters.length >= 2 && candidates.length >= 2;

  const handleAddVoter = (name) => {
    onUpdateVoters([...voters, name]);
  };

  const handleRemoveVoter = (name) => {
    onUpdateVoters(voters.filter(v => v !== name));
  };

  const handleAddCandidate = (name) => {
    onUpdateCandidates([...candidates, name]);
  };

  const handleRemoveCandidate = (name) => {
    onUpdateCandidates(candidates.filter(c => c !== name));
  };

  return (
    <Card className="config-form" padding="large">
      <Heading level={2} className="config-form__title">
        Configure Voting Session
      </Heading>

      <div className="config-form__sections">
        <div className="config-form__section">
          <div className="config-form__section-title">Voters</div>
          <ConfigList
            title="Voters"
            items={voters}
            onAdd={handleAddVoter}
            onRemove={handleRemoveVoter}
            placeholder="Enter voter name..."
            maxItems={50}
            minItems={2}
            singularLabel="voter"
            pluralLabel="voters"
          />
        </div>

        <div className="config-form__section">
          <div className="config-form__section-title">Candidates</div>
          <ConfigList
            title="Candidates"
            items={candidates}
            onAdd={handleAddCandidate}
            onRemove={handleRemoveCandidate}
            placeholder="Enter candidate name..."
            maxItems={50}
            minItems={2}
            singularLabel="candidate"
            pluralLabel="candidates"
          />
        </div>
      </div>

      <Button
        onClick={onContinue}
        variant="gradient"
        size="large"
        fullWidth
        disabled={!isValid}
        aria-label="Continue to setup with current configuration"
      >
        Continue to Setup
      </Button>

      {!isValid && (
        <div className="config-form__hint" role="status">
          Add at least 2 voters and 2 candidates to continue
        </div>
      )}
    </Card>
  );
}
