import React from "react";
import { useVoting } from "../context/votingContext.jsx";
import { VotingLayout } from "../components/templates/VotingLayout/VotingLayout";
import { Configure } from "./Configure";
import { Setup } from "./Setup";
import { Voting } from "./Voting";
import { Announce } from "./Announce";
import { Eliminated } from "./Eliminated";
import { Winner } from "./Winner";
import { CreateSession } from "./CreateSession";
import { JoinSession } from "./JoinSession";
import { HostDashboard } from "./HostDashboard";
import { Lobby } from "./Lobby";
import { Button, Stack, Typography } from "@mui/material";
import { Card } from "../components/molecules/Card/Card";

function Home({ onHost, onJoin }) {
  return (
    <Card>
      <Typography variant="h5" gutterBottom align="center">Ranked Choice Voting</Typography>
      <Stack spacing={2}>
        <Button variant="contained" onClick={onHost} fullWidth>Host a Session</Button>
        <Button variant="outlined" onClick={onJoin} fullWidth>Join a Session</Button>
      </Stack>
    </Card>
  );
}

export default function App() {
  const { state, dispatch } = useVoting();
  const { stage, round, currentBallot, loser, winner, isHost, voterName, session } = state;

  const getStageInfo = () => {
    if (stage === "home") return "Welcome";
    if (stage === "createSession") return "Create a voting session";
    if (stage === "joinSession") return "Join a session";
    if (stage === "lobby") return `Waiting as ${voterName}`;
    if (stage === "hostDashboard") return `Hosting session ${session?.code}`;
    if (stage === "configure") return "Configure voting session";
    if (stage === "setup") return "Voting setup screen";
    if (stage === "voting") return isHost ? `Round ${round}` : `Voting round ${round}`;
    if (stage === "voterSubmitted") return "Vote submitted";
    if (stage === "announce") return "Preparing to reveal results";
    if (stage === "eliminated") return `${loser} has been eliminated`;
    if (stage === "winner") return `${winner} is the winner`;
    return "";
  };

  return (
    <VotingLayout stageInfo={getStageInfo()}>
      {stage === "home" && (
        <Home
          onHost={() => dispatch({ type: "GOTO_CREATE_SESSION" })}
          onJoin={() => dispatch({ type: "GOTO_JOIN_SESSION" })}
        />
      )}
      {stage === "createSession" && (
        <CreateSession onSessionCreated={(session, hostToken) =>
          dispatch({ type: "SESSION_CREATED", payload: { session, hostToken } })
        } />
      )}
      {stage === "joinSession" && (
        <JoinSession onSessionJoined={(session, voterName) =>
          dispatch({ type: "SESSION_JOINED", payload: { session, voterName } })
        } />
      )}
      {stage === "lobby" && (
        <Lobby
          sessionId={state.sessionId}
          voterName={voterName}
          onSessionStart={(session) => dispatch({ type: "VOTING_STARTED", payload: session })}
        />
      )}
      {stage === "hostDashboard" && (
        <HostDashboard
          session={session}
          hostToken={state.hostToken}
          onStartVoting={() => dispatch({ type: "HOST_START_VOTING" })}
          onReveal={() => dispatch({ type: "HOST_REVEAL" })}
        />
      )}
      {stage === "configure" && <Configure />}
      {stage === "setup" && <Setup />}
      {stage === "voting" && <Voting />}
      {stage === "voterSubmitted" && (
        <Card>
          <Typography variant="h5" align="center">Vote Submitted!</Typography>
          <Typography align="center" color="text.secondary">Waiting for other voters...</Typography>
        </Card>
      )}
      {stage === "announce" && <Announce />}
      {stage === "eliminated" && <Eliminated />}
      {stage === "winner" && <Winner />}
    </VotingLayout>
  );
}
