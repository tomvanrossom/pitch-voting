import React, { useEffect, useState } from 'react'
import { Typography, Stack, Button, List, ListItem, ListItemIcon, ListItemText, Box, Chip, Collapse } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import PersonIcon from '@mui/icons-material/Person'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/molecules/Card/Card'
import { useRealtimeBallots } from '../../hooks/useRealtimeBallots'
import { QRCodeDisplay } from '../../components/molecules/QRCodeDisplay'
import { getSessionById } from '../../services/sessionService'

export function HostDashboard({ session, hostToken, onReveal, onStartVoting }) {
  const { t } = useTranslation()
  const isVoting = session.stage === 'voting'
  const { ballotCount, votersSubmitted, reset } = useRealtimeBallots(session.id, isVoting)
  const [joinedVoters, setJoinedVoters] = useState(session.joined_voters || [])

  // Reset ballot count when round changes
  useEffect(() => {
    reset()
  }, [session.round])

  // Poll for joined voters during setup
  useEffect(() => {
    if (session.stage !== 'setup') return

    const pollJoined = async () => {
      try {
        const data = await getSessionById(session.id)
        setJoinedVoters(data.joined_voters || [])
      } catch (err) {
        console.error('Failed to poll joined voters:', err)
      }
    }

    pollJoined()
    const interval = setInterval(pollJoined, 3000)
    return () => clearInterval(interval)
  }, [session.id, session.stage])
  const allVotesIn = ballotCount >= session.voters.length
  const allJoined = joinedVoters.length >= session.voters.length

  return (
    <Card>
      <Stack spacing={3}>
        <Typography variant="h5">{t('hostDashboard.title')}</Typography>

        <Collapse in={session.stage === 'setup' && !allJoined}>
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
              {t('hostDashboard.scanToJoin')} <strong>{session.code}</strong>
            </Typography>
          </Box>
        </Collapse>

        {session.stage === 'setup' && (
          <>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {t('hostDashboard.joined')} ({joinedVoters.length}/{session.voters.length})
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {session.voters.map(voter => {
                  const hasJoined = joinedVoters.includes(voter)
                  return (
                    <Chip
                      key={voter}
                      label={voter}
                      color={hasJoined ? 'success' : 'default'}
                      variant={hasJoined ? 'filled' : 'outlined'}
                      size="small"
                    />
                  )
                })}
              </Stack>
            </Box>
            <Button variant="contained" onClick={onStartVoting} fullWidth>
              {t('hostDashboard.startVoting', { round: session.round })}
            </Button>
          </>
        )}

        {isVoting && (
          <>
            <Typography variant="h6">{t('hostDashboard.roundWaiting', { round: session.round })}</Typography>
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
            <Typography>{t('hostDashboard.votesReceived', { count: ballotCount, total: session.voters.length })}</Typography>
            <Button variant="contained" onClick={onReveal} disabled={!allVotesIn} fullWidth>
              {allVotesIn ? t('hostDashboard.revealResult') : t('hostDashboard.waitingForVotes')}
            </Button>
          </>
        )}
      </Stack>
    </Card>
  )
}
