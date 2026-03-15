import React from 'react';
import { useVoting } from '../../context/votingContext.jsx';
import { Stepper } from '../../components/organisms/Stepper/Stepper';
import { VotingInfoPanel } from '../../components/organisms/VotingInfoPanel/VotingInfoPanel';
import { TapRankBallot } from '../../components/organisms/TapRankBallot';
import './Voting.scss';

export function Voting() {
  const { state } = useVoting();
  const { candidates, round, currentBallot, eliminatedHistory, voters, voterName } = state;

  // For multi-device mode (Supabase), voters use their own name
  // For local mode, use the current ballot index
  const currentVoterName = voterName || voters[currentBallot];

  return (
    <section className="voting">
      <TapRankBallot
        candidates={candidates}
        voterName={currentVoterName}
      />

      <Stepper
        totalRounds={state.candidates.length - 1}
        currentRound={round}
        eliminatedHistory={eliminatedHistory}
      />

      <VotingInfoPanel
        eliminatedCandidates={eliminatedHistory}
      />
    </section>
  );
}
