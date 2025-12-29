import React from 'react';
import { StepperItem } from '../../molecules/StepperItem/StepperItem';
import './Stepper.scss';

export function Stepper({ 
  totalRounds, 
  currentRound, 
  eliminatedHistory = [],
}) {
  return (
    <nav className="stepper" aria-label="Voting rounds progress">
      <ol className="stepper__list">
        {Array.from({ length: totalRounds }).map((_, idx) => (
          <StepperItem
            key={idx}
            number={idx + 1}
            label={`Round ${idx + 1}`}
            active={idx + 1 === currentRound}
            completed={idx + 1 < currentRound}
            eliminatedCandidate={eliminatedHistory[idx]}
          />
        ))}
      </ol>
    </nav>
  );
}
