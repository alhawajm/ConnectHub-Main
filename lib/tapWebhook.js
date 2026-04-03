import crypto from 'crypto'

const THREE_DECIMAL_CURRENCIES = new Set(['BHD', 'JOD', 'KWD', 'OMR', 'TND'])

function getTapCurrencyPrecision(currency = '') {
  return THREE_DECIMAL_CURRENCIES.has(String(currency).toUpperCase()) ? 3 : 2
}

function formatTapWebhookAmount(amount, currency) {
  const precision = getTapCurrencyPrecision(currency)
  return Number(amount || 0).toFixed(precision)
}

export function buildTapWebhookHashString(payload = {}) {
  const id = payload.id || ''
  const amount = formatTapWebhookAmount(payload.amount, payload.currency)
  const currency = payload.currency || ''
  const gatewayReference = payload.reference?.gateway || ''
  const paymentReference = payload.reference?.payment || ''
  const status = payload.status || ''
  const created = payload.transaction?.created || payload.created || ''

  return (
    `x_id${id}` +
    `x_amount${amount}` +
    `x_currency${currency}` +
    `x_gateway_reference${gatewayReference}` +
    `x_payment_reference${paymentReference}` +
    `x_status${status}` +
    `x_created${created}`
  )
}

export function verifyTapWebhookSignature(payload, headers, secretKey) {
  if (!secretKey) {
    return {
      ok: false,
      reason: 'Tap webhook verification is not configured.',
    }
  }

  const receivedHash =
    headers.get('hashstring') ||
    headers.get('Hashstring') ||
    headers.get('hash') ||
    headers.get('Hash')

  if (!receivedHash) {
    return {
      ok: false,
      reason: 'Tap webhook signature header is missing.',
    }
  }

  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(buildTapWebhookHashString(payload))
    .digest('hex')

  const received = Buffer.from(String(receivedHash).trim().toLowerCase())
  const expected = Buffer.from(expectedHash.toLowerCase())

  if (received.length !== expected.length) {
    return {
      ok: false,
      reason: 'Tap webhook signature length mismatch.',
    }
  }

  return {
    ok: crypto.timingSafeEqual(received, expected),
    reason: 'Tap webhook signature did not match.',
    expectedHash,
  }
}
