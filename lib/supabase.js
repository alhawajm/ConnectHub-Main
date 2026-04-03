import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Supabase browser client
 * Use this in Client Components ('use client')
 *
 * Usage:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('jobs').select('*')
 */
export function createClient() {
  return createClientComponentClient()
}
