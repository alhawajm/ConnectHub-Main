import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Supabase server client — for Server Components
 * Reads the session from the cookie automatically
 *
 * Usage (in a server component):
 *   const supabase = createServerClient()
 *   const { data: { session } } = await supabase.auth.getSession()
 */
export function createServerClient() {
  return createServerComponentClient({ cookies })
}

/**
 * Supabase route handler client — for API Route Handlers (app/api/*)
 *
 * Usage (in an API route):
 *   const supabase = createRouteClient()
 *   const { data: { session } } = await supabase.auth.getSession()
 */
export function createRouteClient() {
  return createRouteHandlerClient({ cookies })
}
