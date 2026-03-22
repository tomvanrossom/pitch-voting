import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoting } from '../../context/votingContext.jsx';
import { Alert } from '../../components/molecules/Alert/Alert';
import { Button } from '../../components/atoms/Button/Button';
import { Heading } from '../../components/atoms/Heading/Heading';
import { getSessionById } from '../../services/sessionService';
import './Eliminated.scss';

export function Eliminated() {
  const { t } = useTranslation();
  const { state, dispatch } = useVoting();
  const { loser, round, isHost, sessionId } = state;
  const headingRef = useRef(null);

  // Focus heading on mount for screen reader announcement
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

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
      <Heading level={2} id="eliminated-heading" className="sr-only" ref={headingRef} tabIndex={-1}>
        {t('eliminated.roundResult')}
      </Heading>
      <Alert variant="warning">
        {t('eliminated.loserThisRound')} <strong>{loser}</strong>
      </Alert>
      {isHost ? (
        <Button
          onClick={handleNextRound}
          variant="primary"
          size="large"
          aria-label={t('eliminated.proceedToRound', { round: round + 1 })}
        >
          {t('eliminated.nextRound')}
        </Button>
      ) : (
        <div className="eliminated__waiting">
          <div className="eliminated__spinner" aria-hidden="true" />
          <p className="eliminated__waiting-text">
            {t('eliminated.waitingForHost')}
          </p>
        </div>
      )}
    </article>
  );
}
