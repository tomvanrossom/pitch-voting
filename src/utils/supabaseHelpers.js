import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function createHostClient(hostToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { 'x-host-token': hostToken }
    }
  })
}
