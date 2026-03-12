import React, { useEffect, useState } from 'react'
import { Typography, CircularProgress, Stack } from '@mui/material'
import { Card } from '../../components/molecules/Card/Card'
import { getSessionById } from '../../services/sessionService'

export function Lobby({ sessionId, voterName, onSessionStart }) {
  const [session, setSession] = useState(null)

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
      <Stack spacing={2} alignItems="center">
        <Typography variant="h5">Welcome, {voterName}!</Typography>
        <CircularProgress />
        <Typography color="text.secondary">Waiting for host to start voting...</Typography>
        {session && (
          <Typography variant="body2">
            {session.voters.length} voters, {session.candidates.length} candidates
          </Typography>
        )}
      </Stack>
    </Card>
  )
}
