import { supabase } from '../lib/supabase'

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
