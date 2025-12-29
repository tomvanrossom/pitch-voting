import React from "react";
import { useVoting, VOTERS } from "../context/votingContext.jsx";
import { VotingLayout } from "../components/templates/VotingLayout/VotingLayout";
import { Setup } from "./Setup";
import { Voting } from "./Voting";
import { Announce } from "./Announce";
import { Eliminated } from "./Eliminated";
import { Winner } from "./Winner";

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
      {stage === "setup" && <Setup />}
      {stage === "voting" && <Voting />}
      {stage === "announce" && <Announce />}
      {stage === "eliminated" && <Eliminated />}
      {stage === "winner" && <Winner />}
    </VotingLayout>
  );
}
