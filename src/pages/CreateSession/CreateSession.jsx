import React, { useState } from 'react'
import { Box, TextField, Button, Typography, Stack } from '@mui/material'
import { createSession } from '../../services/sessionService'
import { Card } from '../../components/molecules/Card/Card'

export function CreateSession({ onSessionCreated }) {
  const [voters, setVoters] = useState('')
  const [candidates, setCandidates] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const voterList = voters.split(',').map(v => v.trim()).filter(Boolean)
      const candidateList = candidates.split(',').map(c => c.trim()).filter(Boolean)

      if (voterList.length < 2) {
        throw new Error('At least 2 voters required')
      }
      if (candidateList.length < 2) {
        throw new Error('At least 2 candidates required')
      }

      const { session, hostToken } = await createSession(voterList, candidateList)
      localStorage.setItem(`host_${session.id}`, hostToken)
      onSessionCreated(session, hostToken)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Typography variant="h5" gutterBottom>Create Voting Session</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Voters (comma-separated)"
            value={voters}
            onChange={(e) => setVoters(e.target.value)}
            placeholder="Alice, Bob, Charlie"
            fullWidth
            required
          />
          <TextField
            label="Candidates (comma-separated)"
            value={candidates}
            onChange={(e) => setCandidates(e.target.value)}
            placeholder="Option A, Option B, Option C"
            fullWidth
            required
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? 'Creating...' : 'Create Session'}
          </Button>
        </Stack>
      </form>
    </Card>
  )
}
