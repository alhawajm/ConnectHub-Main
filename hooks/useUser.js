'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

/**
 * useUser — central hook for auth state + profile data
 *
 * Returns { user, profile, roleProfile, loading, refresh }
 *
 * roleProfile is the role-specific table row:
 *   employer   → employer_profiles row
 *   seeker     → seeker_profiles row
 *   freelancer → freelancer_profiles row
 *
 * Usage:
 *   const { user, profile, loading } = useUser()
 *   if (loading) return <Spinner />
 *   if (!user) return null  // middleware handles redirect
 */
export function useUser({ redirectTo = '/login', requiredRole = null } = {}) {
  const supabase = createClient()
  const router   = useRouter()

  const [user,        setUser]        = useState(null)
  const [profile,     setProfile]     = useState(null)
  const [roleProfile, setRoleProfile] = useState(null)
  const [loading,     setLoading]     = useState(true)

  const fetchProfile = useCallback(async (userId, role) => {
    // Base profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(prof)

    // Role-specific profile
    const roleTable = {
      employer:   'employer_profiles',
      seeker:     'seeker_profiles',
      freelancer: 'freelancer_profiles',
    }[role]

    if (roleTable) {
      const { data: rp } = await supabase
        .from(roleTable)
        .select('*')
        .eq('id', userId)
        .single()
      setRoleProfile(rp)
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        if (redirectTo) router.push(redirectTo)
        setLoading(false)
        return
      }

      setUser(session.user)
      const role = session.user.user_metadata?.role
      await fetchProfile(session.user.id, role)

      // Guard: wrong role for this page
      if (requiredRole && role !== requiredRole && role !== 'admin') {
        router.push(`/dashboard/${role}`)
        return
      }
    } catch (err) {
      console.error('[useUser]', err)
    } finally {
      setLoading(false)
    }
  }, [redirectTo, requiredRole, fetchProfile])

  useEffect(() => {
    load()

    // Listen for auth changes (sign in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_OUT') {
          setUser(null); setProfile(null); setRoleProfile(null)
          if (redirectTo) router.push(redirectTo)
        } else if (event === 'SIGNED_IN') {
          load()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [load])

  return { user, profile, roleProfile, loading, refresh: load }
}

/**
 * useNotifications — fetches unread notifications for the current user
 * Subscribes to real-time updates via Supabase Realtime
 */
export function useNotifications(userId) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)

  useEffect(() => {
    if (!userId) return

    // Initial fetch
    const fetch = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      setNotifications(data || [])
      setUnreadCount((data || []).filter(n => !n.is_read).length)
    }
    fetch()

    // Real-time subscription
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(c => c + 1)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const markRead = async (notificationId) => {
    if (!notificationId) return

    const target = notifications.find(n => n.id === notificationId)
    if (!target || target.is_read) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)

    setNotifications(prev => prev.map(n => (
      n.id === notificationId ? { ...n, is_read: true } : n
    )))
    setUnreadCount(count => Math.max(count - 1, 0))
  }

  return { notifications, unreadCount, markAllRead, markRead }
}
