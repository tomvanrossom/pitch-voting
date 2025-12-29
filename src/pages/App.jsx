import React from "react";
import { useVoting, VOTERS } from "../context/votingContext.jsx";
import { VotingLayout } from "../components/templates/VotingLayout/VotingLayout";
import { SetupPage } from "./SetupPage";
import { VotingPage } from "./VotingPage";
import { AnnouncePage } from "./AnnouncePage";
import { EliminatedPage } from "./EliminatedPage";
import { WinnerPage } from "./WinnerPage";

export default function App() {
  const { state } = useVoting();
  const { stage, round, currentBallot, loser, winner } = state;

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
      {stage === "setup" && <SetupPage />}
      {stage === "voting" && <VotingPage />}
      {stage === "announce" && <AnnouncePage />}
      {stage === "eliminated" && <EliminatedPage />}
      {stage === "winner" && <WinnerPage />}
    </VotingLayout>
  );
}
