import React, { useState } from 'react'
import { TextField, Button, Typography, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { joinSession } from '../../services/sessionService'
import { Card } from '../../components/molecules/Card/Card'

export function JoinSession({ onSessionJoined }) {
  const [code, setCode] = useState('')
  const [session, setSession] = useState(null)
  const [selectedVoter, setSelectedVoter] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

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
          <FormControl fullWidth>
            <InputLabel>Who are you?</InputLabel>
            <Select value={selectedVoter} label="Who are you?" onChange={(e) => setSelectedVoter(e.target.value)}>
              {session.voters.map(voter => (
                <MenuItem key={voter} value={voter}>{voter}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
