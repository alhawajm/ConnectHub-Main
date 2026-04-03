import { createAdminClient } from '@/lib/supabaseAdmin'

function isMissingTableError(error) {
  const message = error?.message || ''
  return message.includes('analytics_events') || message.includes('relation') || message.includes('does not exist')
}

async function notifyAdmins(adminClient, { title, body, link = '/dashboard/admin' }) {
  const { data: admins, error } = await adminClient
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (error || !admins?.length) return

  const rows = admins.map(admin => ({
    user_id: admin.id,
    type: 'system',
    title,
    body,
    link,
  }))

  await adminClient.from('notifications').insert(rows)
}

export async function recordAnalyticsEvent({
  source = 'server',
  category,
  action,
  level = 'info',
  actorId = null,
  actorRole = null,
  route = null,
  message = null,
  metadata = {},
  notify = false,
  notificationTitle,
  notificationBody,
  notificationLink,
}) {
  try {
    const adminClient = createAdminClient()
    const payload = {
      source,
      category,
      action,
      level,
      actor_id: actorId,
      actor_role: actorRole,
      route,
      message,
      metadata,
    }

    const { error } = await adminClient.from('analytics_events').insert(payload)

    if (error && !isMissingTableError(error)) {
      console.error('Telemetry insert failed:', error.message)
    }

    if (notify || level === 'error') {
      await notifyAdmins(adminClient, {
        title: notificationTitle || 'System alert',
        body: notificationBody || message || `${category} ${action}`,
        link: notificationLink || '/dashboard/admin',
      })
    }
  } catch (error) {
    console.error('Telemetry pipeline failed:', error?.message || error)
  }
}

export async function recordServerError({
  category,
  action,
  error,
  actorId = null,
  actorRole = null,
  route = null,
  metadata = {},
  notificationTitle,
  notificationBody,
}) {
  const message = error instanceof Error ? error.message : String(error || 'Unknown error')

  await recordAnalyticsEvent({
    source: 'server',
    category,
    action,
    level: 'error',
    actorId,
    actorRole,
    route,
    message,
    metadata,
    notify: true,
    notificationTitle,
    notificationBody: notificationBody || `${category} ${action} failed: ${message}`,
  })
}
