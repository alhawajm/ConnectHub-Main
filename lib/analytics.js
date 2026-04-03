'use client'

export async function trackEvent(action, payload = {}) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
      keepalive: true,
      cache: 'no-store',
    })
  } catch {
    // Client analytics should never block user actions.
  }
}
