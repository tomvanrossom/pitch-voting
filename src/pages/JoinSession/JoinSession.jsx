import React, { useState, useEffect, useRef } from 'react'
import { TextField, Button, Typography, Stack } from '@mui/material'
import { joinSession } from '../../services/sessionService'
import { Card } from '../../components/molecules/Card/Card'
import { VoterChip } from '../../components/molecules/VoterChip'

export function JoinSession({ onSessionJoined, initialCode = '' }) {
  const [code, setCode] = useState(initialCode)
  const [session, setSession] = useState(null)
  const [selectedVoter, setSelectedVoter] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const autoSubmitRan = useRef(false)

  // Auto-submit if initialCode is provided
  useEffect(() => {
    if (initialCode && !autoSubmitRan.current) {
      autoSubmitRan.current = true
      let cancelled = false
      setLoading(true)
      joinSession(initialCode)
        .then(found => { if (!cancelled) setSession(found) })
        .catch(() => { if (!cancelled) setError('Session not found. Check your code.') })
        .finally(() => { if (!cancelled) setLoading(false) })
      return () => { cancelled = true }
    }
  }, [initialCode])

  const handleLookup = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const found = await joinSession(code)
      setSession(found)
    } catch (err) {
      setError('Session not found. Check your code.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = () => {
    if (!selectedVoter) return
    localStorage.setItem('voter_session', JSON.stringify({
      sessionId: session.id,
      voterName: selectedVoter
    }))
    onSessionJoined(session, selectedVoter)
  }

  if (session) {
    return (
      <Card>
        <Typography variant="h5" gutterBottom>Select Your Name</Typography>
        <Stack spacing={2}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {session.voters.map(voter => (
              <VoterChip
                key={voter}
                name={voter}
                selected={selectedVoter === voter}
                onSelect={setSelectedVoter}
              />
            ))}
          </div>
          <Button variant="contained" onClick={handleJoin} disabled={!selectedVoter} fullWidth>
            Join Session
          </Button>
        </Stack>
      </Card>
    )
  }

  return (
    <Card>
      <Typography variant="h5" gutterBottom>Join Voting Session</Typography>
      <form onSubmit={handleLookup}>
        <Stack spacing={2}>
          <TextField
            label="Session Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            inputProps={{ maxLength: 6, style: { textTransform: 'uppercase' } }}
            fullWidth
            required
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? 'Looking up...' : 'Find Session'}
          </Button>
        </Stack>
      </form>
    </Card>
  )
}
