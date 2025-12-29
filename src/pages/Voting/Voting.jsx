import React from 'react';
import { useVoting, VOTERS, OPTIONS } from '../../context/votingContext.jsx';
import { Stepper } from '../../components/organisms/Stepper/Stepper';
import { VotingInfoPanel } from '../../components/organisms/VotingInfoPanel/VotingInfoPanel';
import BallotForm from '../../components/organisms/BallotForm/BallotForm';
import { Heading } from '../../components/atoms/Heading/Heading';
import './Voting.scss';

export function Voting() {
  const { state } = useVoting();
  const { candidates, round, currentBallot, eliminatedHistory } = state;

  return (
    <section className="voting" aria-labelledby="voting-title">
      <Heading level={2} id="voting-title" className="voting__title">
        {VOTERS[currentBallot]}'s turn to vote
      </Heading>
      
      <Stepper
        totalRounds={OPTIONS.length - 1}
        currentRound={round}
        eliminatedHistory={eliminatedHistory}
      />

      <VotingInfoPanel
        remainingCandidates={candidates}
        eliminatedCandidates={eliminatedHistory}
      />

      <BallotForm
        candidates={candidates}
        voterName={VOTERS[currentBallot]}
      />
    </section>
  );
}
