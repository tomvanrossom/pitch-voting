import { supabase } from '../lib/supabase'
import { createHostClient } from '../utils/supabaseHelpers'

export async function submitBallot(sessionId, round, voterName, rankings) {
  const { data, error } = await supabase
    .rpc('insert_ballot', {
      p_session_id: sessionId,
      p_round: round,
      p_voter_name: voterName,
      p_rankings: rankings
    })

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already submitted a ballot for this round')
    }
    throw error
  }

  return data
}

export async function getRoundBallots(sessionId, round, hostToken) {
  const client = createHostClient(hostToken)

  const { data, error } = await client
    .from('ballots')
    .select('voter_name, rankings')
    .eq('session_id', sessionId)
    .eq('round', round)

  if (error) {
    throw error
  }

  return data
}
