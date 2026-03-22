import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { Card } from "../components/molecules/Card/Card";
import { Button } from "../components/atoms/Button/Button";
import "./App.scss";

function Home({ onHost, onJoin }) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="home">
        <h1 className="home__title">{t('app.title')}</h1>
        <div className="home__actions">
          <Button variant="primary" onClick={onHost} fullWidth>{t('home.hostSession')}</Button>
          <Button variant="secondary" onClick={onJoin} fullWidth>{t('home.joinSession')}</Button>
        </div>
      </div>
    </Card>
  );
}

export default function App() {
  const { t } = useTranslation();
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
    if (stage === "home") return t('stageInfo.welcome');
    if (stage === "createSession") return t('stageInfo.createSession');
    if (stage === "joinSession") return t('stageInfo.joinSession');
    if (stage === "lobby") return t('stageInfo.waitingAs', { name: voterName });
    if (stage === "hostDashboard") return t('stageInfo.hostingSession', { code: session?.code });
    if (stage === "configure") return t('stageInfo.configure');
    if (stage === "setup") return t('stageInfo.setup');
    if (stage === "voting") return isHost ? t('stageInfo.round', { round }) : t('stageInfo.votingRound', { round });
    if (stage === "voterSubmitted") return t('stageInfo.voteSubmitted');
    if (stage === "announce") return t('stageInfo.announce');
    if (stage === "eliminated") return t('stageInfo.eliminated', { loser });
    if (stage === "winner") return t('stageInfo.winner', { winner });
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
