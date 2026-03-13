import React, { useEffect } from 'react'
import { Typography, Stack, Button, Chip, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Card } from '../../components/molecules/Card/Card'
import { useRealtimeBallots } from '../../hooks/useRealtimeBallots'
import { QRCodeDisplay } from '../../components/molecules/QRCodeDisplay'

export function HostDashboard({ session, hostToken, onReveal, onStartVoting }) {
  const isVoting = session.stage === 'voting'
  const { ballotCount, votersSubmitted, reset } = useRealtimeBallots(session.id, isVoting)

  // Reset ballot count when round changes
  useEffect(() => {
    reset()
  }, [session.round])
  const allVotesIn = ballotCount >= session.voters.length

  return (
    <Card>
      <Stack spacing={3}>
        <Typography variant="h5">Host Dashboard</Typography>

        <Box
          sx={{
            textAlign: 'center',
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 2,
          }}
        >
          <QRCodeDisplay
            code={session.code}
            baseUrl={window.location.origin + import.meta.env.BASE_URL}
          />
          <Typography sx={{ mt: 1 }}>
            Scan to join or enter: <strong>{session.code}</strong>
          </Typography>
        </Box>

        {session.stage === 'setup' && (
          <Button variant="contained" onClick={onStartVoting} fullWidth>
            Start Voting (Round {session.round})
          </Button>
        )}

        {isVoting && (
          <>
            <Typography variant="h6">Round {session.round} - Waiting for votes</Typography>
            <List>
              {session.voters.map(voter => {
                const hasVoted = votersSubmitted.includes(voter)
                return (
                  <ListItem key={voter}>
                    <ListItemIcon>
                      {hasVoted ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="disabled" />}
                    </ListItemIcon>
                    <ListItemText primary={voter} />
                  </ListItem>
                )
              })}
            </List>
            <Typography>{ballotCount}/{session.voters.length} votes received</Typography>
            <Button variant="contained" onClick={onReveal} disabled={!allVotesIn} fullWidth>
              {allVotesIn ? 'Reveal Result' : 'Waiting for all votes...'}
            </Button>
          </>
        )}
      </Stack>
    </Card>
  )
}
