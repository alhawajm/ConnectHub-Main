import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function DashboardIndexPage() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login?redirect=/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle()

  redirect(profile?.role ? `/dashboard/${profile.role}` : '/auth/role')
}
