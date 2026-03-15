import React, { useEffect } from 'react';
import { Typography, CircularProgress, Stack } from '@mui/material';
import { useVoting } from '../../context/votingContext.jsx';
import { Alert } from '../../components/molecules/Alert/Alert';
import { Button } from '../../components/atoms/Button/Button';
import { Heading } from '../../components/atoms/Heading/Heading';
import { getSessionById } from '../../services/sessionService';
import './Eliminated.scss';

export function Eliminated() {
  const { state, dispatch } = useVoting();
  const { loser, round, isHost, sessionId } = state;

  // Voters poll for next round
  useEffect(() => {
    if (isHost || !sessionId) return;

    const pollSession = async () => {
      try {
        const session = await getSessionById(sessionId);
        if (session.stage === 'voting' && session.round > round) {
          dispatch({ type: 'VOTER_SESSION_UPDATE', payload: session });
        }
      } catch (err) {
        console.error('Failed to poll session:', err);
      }
    };

    const interval = setInterval(pollSession, 2000);
    return () => clearInterval(interval);
  }, [isHost, sessionId, round, dispatch]);

  const handleNextRound = () => dispatch({ type: 'NEXT_ROUND' });

  return (
    <article className="eliminated" aria-labelledby="eliminated-heading">
      <Heading level={2} id="eliminated-heading" className="sr-only">
        Round Result
      </Heading>
      <Alert variant="warning">
        Eliminated this round: <strong>{loser}</strong>
      </Alert>
      {isHost ? (
        <Button
          onClick={handleNextRound}
          variant="primary"
          size="large"
          aria-label={`Proceed to round ${round + 1} of voting`}
        >
          Next Round
        </Button>
      ) : (
        <Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">
            Waiting for host to start next round...
          </Typography>
        </Stack>
      )}
    </article>
  );
}
