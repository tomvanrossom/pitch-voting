import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/molecules/Card/Card'
import { getSessionById, registerVoterJoined } from '../../services/sessionService'
import './Lobby.scss'

export function Lobby({ sessionId, voterName, onSessionStart }) {
  const { t } = useTranslation()
  const [session, setSession] = useState(null)

  // Register voter as joined when entering lobby
  useEffect(() => {
    registerVoterJoined(sessionId, voterName).catch(err => {
      console.error('Failed to register voter:', err)
    })
  }, [sessionId, voterName])

  useEffect(() => {
    const pollSession = async () => {
      try {
        const data = await getSessionById(sessionId)
        setSession(data)
        if (data.stage === 'voting') {
          onSessionStart(data)
        }
      } catch (err) {
        console.error('Failed to poll session:', err)
      }
    }

    pollSession()
    const interval = setInterval(pollSession, 3000)
    return () => clearInterval(interval)
  }, [sessionId, onSessionStart])

  return (
    <Card>
      <div className="lobby">
        <h2 className="lobby__title">{t('lobby.welcome', { name: voterName })}</h2>
        <div className="lobby__spinner" aria-hidden="true" />
        <p className="lobby__status">{t('lobby.waiting')}</p>
        {session && (
          <p className="lobby__info">
            {t('lobby.votersAndCandidates', { voters: session.voters.length, candidates: session.candidates.length })}
          </p>
        )}
      </div>
    </Card>
  )
}
