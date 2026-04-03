export async function sendTransactionalEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'ConnectHub <no-reply@connecthub.bh>'

  if (!apiKey) {
    return { sent: false, skipped: true, reason: 'RESEND_API_KEY is not configured.' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.message || 'Could not send transactional email.')
  }

  return { sent: true, data: payload }
}
