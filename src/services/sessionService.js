import { supabase } from '../lib/supabase'
import { createHostClient } from '../utils/supabaseHelpers'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous: 0,O,1,I

export function generateSessionCode() {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export async function createSession(voters, candidates) {
  const code = generateSessionCode()

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      code,
      voters,
      candidates,
      stage: 'setup'
    })
    .select()
    .single()

  if (error) {
    // Retry with new code if collision
    if (error.code === '23505') {
      return createSession(voters, candidates)
    }
    throw error
  }

  return {
    session: data,
    hostToken: data.host_token
  }
}

export async function joinSession(code) {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, code, voters, candidates, stage, round, current_voter, eliminated, score_history, winner')
    .eq('code', code.toUpperCase())
    .single()

  if (error) {
    throw new Error('Session not found')
  }

  return data
}

export async function getSessionById(sessionId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, code, voters, candidates, stage, round, current_voter, eliminated, score_history, winner')
    .eq('id', sessionId)
    .single()

  if (error) {
    throw new Error('Session not found')
  }

  return data
}

export async function updateSession(sessionId, updates, hostToken) {
  const client = createHostClient(hostToken)

  const { data, error } = await client
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update session: ' + error.message)
  }

  return data
}
