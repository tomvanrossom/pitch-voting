import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/molecules/Card/Card'
import { getSessionById } from '../../services/sessionService'
import './VoterWaiting.scss'

export function VoterWaiting({ sessionId, voterName, currentRound, onSessionUpdate }) {
  const { t } = useTranslation()
  const [polling, setPolling] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    const pollSession = async () => {
      try {
        const session = await getSessionById(sessionId)

        // Check if session moved to a result stage
        if (session.stage === 'eliminated' || session.stage === 'winner') {
          setPolling(false)
          onSessionUpdate(session)
        }
        // Check if moved to next round (session round is higher than when voter submitted)
        else if (session.stage === 'voting' && session.round > currentRound) {
          setPolling(false)
          onSessionUpdate(session)
        }
      } catch (err) {
        console.error('Failed to poll session:', err)
      }
    }

    pollSession()
    const interval = setInterval(pollSession, 2000)

    return () => clearInterval(interval)
  }, [sessionId, currentRound, onSessionUpdate])

  return (
    <Card>
      <div className="voter-waiting">
        <h2 className="voter-waiting__title">{t('voterWaiting.submitted')}</h2>
        <div className="voter-waiting__spinner" aria-hidden="true" />
        <p className="voter-waiting__status">
          {t('voterWaiting.waiting', { name: voterName })}
        </p>
        <p className="voter-waiting__info">
          {t('voterWaiting.resultsWillAppear')}
        </p>
      </div>
    </Card>
  )
}
