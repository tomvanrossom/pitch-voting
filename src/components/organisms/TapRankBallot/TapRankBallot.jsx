import React, { useState, useEffect, useMemo } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useVoting } from '../../../context/votingContext.jsx'
import { submitBallot } from '../../../services/ballotService'
import { Card } from '../../molecules/Card/Card'
import { CandidateChip } from '../../molecules/CandidateChip'
import { Button } from '../../atoms/Button/Button'
import './TapRankBallot.scss'

export function TapRankBallot({ candidates, voterName }) {
  const { t } = useTranslation()
  const { state, dispatch } = useVoting()
  const [rankings, setRankings] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSupabaseVoter = state.sessionId && state.voterName && !state.isHost

  // Reset when candidates change
  useEffect(() => {
    setRankings([])
    setError('')
  }, [candidates, voterName])

  function handleTap(name) {
    if (submitting) return
    setError('')

    const existingIndex = rankings.indexOf(name)
    if (existingIndex !== -1) {
      // Remove from rankings
      setRankings(prev => prev.filter(c => c !== name))
    } else {
      // Add to rankings
      if (rankings.length < candidates.length) {
        setRankings(prev => [...prev, name])
      }
    }
  }

  function getRank(name) {
    const index = rankings.indexOf(name)
    return index !== -1 ? index + 1 : null
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (rankings.length !== candidates.length) {
      setError(t('voting.rankAllCandidates'))
      return
    }

    setError('')

    if (isSupabaseVoter) {
      setSubmitting(true)
      try {
        await submitBallot(state.sessionId, state.round, voterName, rankings)
        dispatch({ type: 'VOTER_SUBMITTED' })
      } catch (err) {
        setError(err.message || t('voting.submitError'))
        setSubmitting(false)
      }
    } else {
      dispatch({ type: 'SUBMIT_BALLOT', payload: rankings })
    }
  }

  const allRanked = rankings.length === candidates.length

  // Memoize sorted candidates to avoid re-sorting on every render
  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      const rankA = getRank(a)
      const rankB = getRank(b)
      if (rankA && rankB) return rankA - rankB
      if (rankA) return -1
      if (rankB) return 1
      return 0
    })
  }, [candidates, rankings])

  return (
    <Card className="tap-rank-ballot" padding="large">
      <p className="tap-rank-ballot__instruction">
        {t('voting.instruction')}
      </p>

      <form onSubmit={handleSubmit}>
        <LayoutGroup>
          <div className="tap-rank-ballot__chips">
            {sortedCandidates.map(candidate => (
              <motion.div
                key={candidate}
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <CandidateChip
                  name={candidate}
                  rank={getRank(candidate)}
                  onTap={handleTap}
                  disabled={submitting}
                />
              </motion.div>
            ))}
          </div>
        </LayoutGroup>

        <div className="tap-rank-ballot__error-container" aria-live="assertive" aria-atomic="true">
          {error && (
            <div className="tap-rank-ballot__error" role="alert">
              {error}
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={!allRanked || submitting}
        >
          {submitting ? t('voting.submitting') : t('voting.submitBallot')}
        </Button>
      </form>
    </Card>
  )
}
