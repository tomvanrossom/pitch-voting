import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeBallots(sessionId, enabled = true) {
  const [ballotCount, setBallotCount] = useState(0)
  const [votersSubmitted, setVotersSubmitted] = useState([])

  useEffect(() => {
    if (!enabled || !sessionId) return

    const channel = supabase
      .channel(`ballots:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ballots',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setBallotCount(prev => prev + 1)
          setVotersSubmitted(prev => [...prev, payload.new.voter_name])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, enabled])

  const reset = () => {
    setBallotCount(0)
    setVotersSubmitted([])
  }

  return { ballotCount, votersSubmitted, reset }
}
