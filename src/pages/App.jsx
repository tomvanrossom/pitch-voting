import React, { useState, useEffect } from "react";
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
import { VoterWaiting } from "./VoterWaiting";
import { Button, Stack, Typography, Card } from "@mui/material";

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
  const [joinCode, setJoinCode] = useState(null);

  // Read ?join= parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("join");
    if (code) {
      // Clear any stale voter session to start fresh
      localStorage.removeItem('voter_session');
      setJoinCode(code.toUpperCase());
      // Clear the URL parameter
      window.history.replaceState({}, "", window.location.pathname);
      // Navigate to join session
      dispatch({ type: "GOTO_JOIN_SESSION" });
    }
  }, [dispatch]);

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
        <JoinSession
          initialCode={joinCode}
          onSessionJoined={(session, voterName) => {
            setJoinCode(null);
            dispatch({ type: "SESSION_JOINED", payload: { session, voterName } });
          }}
        />
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
        <VoterWaiting
          sessionId={state.sessionId}
          voterName={voterName}
          currentRound={round}
          onSessionUpdate={(session) => dispatch({ type: "VOTER_SESSION_UPDATE", payload: session })}
        />
      )}
      {stage === "announce" && <Announce />}
      {stage === "eliminated" && <Eliminated />}
      {stage === "winner" && <Winner />}
    </VotingLayout>
  );
}
