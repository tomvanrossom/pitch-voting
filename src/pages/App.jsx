import React from "react";
import { useVoting, VOTERS, OPTIONS } from "../context/votingContext.jsx";
import { VotingLayout } from "../components/templates/VotingLayout/VotingLayout";
import { VoterSetupCard } from "../components/organisms/VoterSetupCard/VoterSetupCard";
import { Stepper } from "../components/organisms/Stepper/Stepper";
import { VotingInfoPanel } from "../components/organisms/VotingInfoPanel/VotingInfoPanel";
import { ResultsTable } from "../components/organisms/ResultsTable/ResultsTable";
import BallotForm from "../components/organisms/BallotForm/BallotForm";
import { Button } from "../components/atoms/Button/Button";
import { Heading } from "../components/atoms/Heading/Heading";
import { Icon } from "../components/atoms/Icon/Icon";
import { Alert } from "../components/molecules/Alert/Alert";
import "./App.scss";

export default function App() {
  const { state, dispatch } = useVoting();
  const {
    stage,
    candidates,
    round,
    currentBallot,
    eliminatedHistory,
    scoreHistory,
    loser,
    winner,
  } = state;

  const historyArr = eliminatedHistory.map((el, idx) => ({
    round: idx + 1,
    eliminated: el,
    score: scoreHistory[idx],
  }));

  const suspenseText =
    candidates.length === 2
      ? "And the winner is..."
      : "And the loser is...";

  const startVoting = () => dispatch({ type: "START_VOTING" });
  const revealLoserOrWinner = () => dispatch({ type: "REVEAL_RESULT" });
  const handleNextRound = () => dispatch({ type: "NEXT_ROUND" });
  const handleReset = () => dispatch({ type: "RESET" });

  const getStageInfo = () => {
    if (stage === "setup") return "Voting setup screen";
    if (stage === "voting") return `Voting round ${round}, ${VOTERS[currentBallot]}'s turn`;
    if (stage === "announce") return "Preparing to reveal results";
    if (stage === "eliminated") return `${loser} has been eliminated`;
    if (stage === "winner") return `${winner} is the winner`;
    return "";
  };

  return (
    <VotingLayout stageInfo={getStageInfo()}>

      {/* Setup */}
      {stage === "setup" && (
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
      )}

      {/* Voting round */}
      {stage === "voting" && (
        <section className="voting" aria-labelledby="voting-title">
          <Heading level={2} id="voting-title" className="voting__voter-title">
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
      )}

      {/* Suspense announcement */}
      {stage === "announce" && (
        <section className="announce" aria-labelledby="announce-title">
          <div className="announce__content">
            <Heading level={2} id="announce-title" className="announce__title">
              {suspenseText}
            </Heading>
            <Button
              onClick={revealLoserOrWinner}
              size="large"
              aria-label={`Reveal ${candidates.length === 2 ? 'the winner' : 'the eliminated candidate'} for this round`}
            >
              Reveal
            </Button>
          </div>
        </section>
      )}

      {/* After Reveal, show loser */}
      {stage === "eliminated" && (
        <article className="result" aria-labelledby="eliminated-heading">
          <Heading level={2} id="eliminated-heading" className="sr-only">
            Round Result
          </Heading>
          <Alert variant="warning">
            Eliminated this round: <strong>{loser}</strong>
          </Alert>
          <Button
            onClick={handleNextRound}
            size="large"
            aria-label={`Proceed to round ${round + 1} of voting`}
          >
            Next Round
          </Button>
        </article>
      )}

      {/* Winner screen */}
      {stage === "winner" && (
        <article className="result" aria-labelledby="winner-heading">
          <Heading level={2} id="winner-heading" className="sr-only">
            Final Results
          </Heading>
          <Alert variant="success">
            <Icon emoji="🏆" label="trophy" /> <strong>Winner: {winner}</strong>
          </Alert>
          
          <section className="result__summary" aria-labelledby="summary-title">
            <Heading level={3} id="summary-title" className="result__summary-title">
              Voting summary (elimination order and weighted scores)
            </Heading>
            <ResultsTable
              historyData={historyArr}
              allOptions={OPTIONS}
              winner={winner}
            />
          </section>

          <Button
            onClick={handleReset}
            variant="success"
            size="large"
            aria-label="Restart the voting process from the beginning"
          >
            <Icon emoji="🏆" label="trophy" /> Restart
          </Button>
        </article>
      )}
    </VotingLayout>
  );
}
