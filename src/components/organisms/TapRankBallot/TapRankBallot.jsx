import React, { useState, useEffect } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import { useVoting } from '../../../context/votingContext.jsx'
import { submitBallot } from '../../../services/ballotService'
import { Card } from '../../molecules/Card/Card'
import { CandidateChip } from '../../molecules/CandidateChip'
import { Button } from '../../atoms/Button/Button'
import './TapRankBallot.scss'

export function TapRankBallot({ candidates, voterName }) {
  const { state, dispatch } = useVoting()
  const [rankings, setRankings] = useState([]) // Array of candidate names in rank order
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSupabaseVoter = state.sessionId && state.voterName && !state.isHost

  // Reset when candidates change
  useEffect(() => {
    setRankings([])
    setError('')
  }, [candidates, voterName])

  // Auto-complete last candidate
  useEffect(() => {
    if (rankings.length === candidates.length - 1) {
      const remaining = candidates.find(c => !rankings.includes(c))
      if (remaining) {
        setRankings(prev => [...prev, remaining])
      }
    }
  }, [rankings, candidates])

  function handleTap(name) {
    if (submitting) return
    setError('')

    const existingIndex = rankings.indexOf(name)
    if (existingIndex !== -1) {
      // Remove from rankings
      setRankings(prev => prev.filter(c => c !== name))
    } else {
      // Add to rankings (unless auto-complete will kick in)
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
      setError('Please rank all candidates')
      return
    }

    setError('')

    if (isSupabaseVoter) {
      setSubmitting(true)
      try {
        await submitBallot(state.sessionId, state.round, voterName, rankings)
        dispatch({ type: 'VOTER_SUBMITTED' })
      } catch (err) {
        setError(err.message || 'Failed to submit ballot. Please try again.')
        setSubmitting(false)
      }
    } else {
      dispatch({ type: 'SUBMIT_BALLOT', payload: rankings })
    }
  }

  const allRanked = rankings.length === candidates.length

  return (
    <Card className="tap-rank-ballot" padding="large">
      <p className="tap-rank-ballot__instruction">
        Tap candidates in order of preference
      </p>

      <form onSubmit={handleSubmit}>
        <LayoutGroup>
          <div className="tap-rank-ballot__chips">
            {[...candidates]
              .sort((a, b) => {
                const rankA = getRank(a)
                const rankB = getRank(b)
                // Ranked items first, sorted by rank; unranked items after
                if (rankA && rankB) return rankA - rankB
                if (rankA) return -1
                if (rankB) return 1
                return 0
              })
              .map(candidate => (
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

        {error && (
          <div className="tap-rank-ballot__error" role="alert">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={!allRanked || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Ballot'}
        </Button>
      </form>
    </Card>
  )
}
