import React, { useEffect, useState } from 'react'
import { Typography, CircularProgress, Stack } from '@mui/material'
import { Card } from '../../components/molecules/Card/Card'
import { getSessionById } from '../../services/sessionService'

export function VoterWaiting({ sessionId, voterName, onSessionUpdate }) {
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
        // Check if moved to next round (back to voting)
        else if (session.stage === 'voting' && session.round > 1) {
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
  }, [sessionId, onSessionUpdate])

  return (
    <Card>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h5">Vote Submitted!</Typography>
        <CircularProgress size={32} />
        <Typography color="text.secondary">
          Waiting for other voters, {voterName}...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Results will appear automatically when revealed.
        </Typography>
      </Stack>
    </Card>
  )
}
