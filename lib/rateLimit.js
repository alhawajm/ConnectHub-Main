import { NextResponse } from 'next/server'

const RATE_LIMIT_STORE = globalThis.__connecthubRateLimitStore || new Map()
globalThis.__connecthubRateLimitStore = RATE_LIMIT_STORE

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'local'
  )
}

function buildRateLimitHeaders({ limit, remaining, resetAt, retryAfterSeconds }) {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(remaining, 0)),
    'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
    'Retry-After': String(Math.max(retryAfterSeconds, 1)),
  }
}

function pruneExpiredEntries(now) {
  if (RATE_LIMIT_STORE.size < 500) return

  for (const [key, entry] of RATE_LIMIT_STORE.entries()) {
    if (entry.resetAt <= now) {
      RATE_LIMIT_STORE.delete(key)
    }
  }
}

export function getRateLimitKey(request, bucket, actorId = '') {
  const clientIp = getClientIp(request)
  return [bucket, actorId || 'anon', clientIp].join(':')
}

export function enforceRateLimit({
  request,
  bucket,
  limit,
  windowMs,
  actorId = '',
  message = 'Too many requests. Please try again shortly.',
}) {
  const now = Date.now()
  pruneExpiredEntries(now)

  const key = getRateLimitKey(request, bucket, actorId)
  const current = RATE_LIMIT_STORE.get(key)

  if (!current || current.resetAt <= now) {
    RATE_LIMIT_STORE.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })

    return null
  }

  current.count += 1
  RATE_LIMIT_STORE.set(key, current)

  if (current.count <= limit) {
    return null
  }

  const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000)

  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: buildRateLimitHeaders({
        limit,
        remaining: limit - current.count,
        resetAt: current.resetAt,
        retryAfterSeconds,
      }),
    }
  )
}
