const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!(key in process.env)) process.env[key] = value
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const APP_URL = process.env.QA_APP_URL || 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables.')
  process.exit(1)
}

const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]
const authCookieName = `sb-${projectRef}-auth-token`

const accounts = [
  { role: 'employer', email: 'hr@techmark.bh', password: 'TechMark2026!', dashboardPath: '/dashboard/employer' },
  { role: 'seeker', email: 'yusuf@email.bh', password: 'Seeker2026!', dashboardPath: '/dashboard/seeker' },
  { role: 'freelancer', email: 'sara@designbh.com', password: 'Sara2026!', dashboardPath: '/dashboard/freelancer' },
  { role: 'admin', email: 'admin@connecthub.bh', password: 'Admin@2026!', dashboardPath: '/dashboard/admin' },
]

function encodeSessionCookie(session) {
  return encodeURIComponent(
    JSON.stringify([
      session.access_token,
      session.refresh_token,
      session.provider_token || null,
      session.provider_refresh_token || null,
      session.user?.factors || null,
    ])
  )
}

function parseCookieHeader(cookieHeader) {
  const cookies = new Map()
  if (!cookieHeader) return cookies
  for (const part of cookieHeader.split(/;\s*/)) {
    const [name, ...rest] = part.split('=')
    if (!name) continue
    cookies.set(name, rest.join('='))
  }
  return cookies
}

function serializeCookies(cookieMap) {
  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}

function getSetCookieHeaders(response) {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie()
  }

  const single = response.headers.get('set-cookie')
  return single ? [single] : []
}

function applySetCookies(cookieMap, response) {
  for (const cookie of getSetCookieHeaders(response)) {
    const [pair] = cookie.split(';')
    const [name, ...rest] = pair.split('=')
    const value = rest.join('=')

    if (!name) continue
    if (value === '') {
      cookieMap.delete(name)
    } else {
      cookieMap.set(name, value)
    }
  }
}

async function fetchPage(pathname, cookieMap) {
  return fetch(`${APP_URL}${pathname}`, {
    headers: cookieMap.size ? { Cookie: serializeCookies(cookieMap) } : undefined,
    redirect: 'manual',
  })
}

async function fetchJson(pathname, cookieMap, options = {}) {
  const response = await fetch(`${APP_URL}${pathname}`, {
    ...options,
    headers: {
      ...(cookieMap.size ? { Cookie: serializeCookies(cookieMap) } : {}),
      ...(options.headers || {}),
    },
    redirect: 'manual',
  })

  applySetCookies(cookieMap, response)

  const text = await response.text()
  let payload = null
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = text
  }

  return { response, payload }
}

async function createCookieJar(account) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const signIn = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  })

  if (signIn.error) throw signIn.error

  const jar = new Map()
  jar.set(authCookieName, encodeSessionCookie(signIn.data.session))
  return jar
}

;(async () => {
  const results = []

  try {
    const unauthDashboard = await fetchPage('/dashboard/employer', new Map())
    if (unauthDashboard.status !== 307 || !unauthDashboard.headers.get('location')?.startsWith('/login')) {
      throw new Error('Unauthenticated dashboard access no longer redirects to login.')
    }
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }

  for (const account of accounts) {
    try {
      const jar = await createCookieJar(account)

      const loginRedirect = await fetchPage('/login', jar)
      if (loginRedirect.status !== 307 || loginRedirect.headers.get('location') !== account.dashboardPath) {
        throw new Error(`/login did not redirect ${account.role} to ${account.dashboardPath}`)
      }

      const switchPage = await fetchPage('/login?switch=1', jar)
      await switchPage.text()
      if (switchPage.status !== 200 || switchPage.headers.get('location')) {
        throw new Error(`/login?switch=1 did not stay accessible for ${account.role}`)
      }

      const { response: meBeforeLogout, payload: meBeforePayload } = await fetchJson('/api/users/me', jar)
      if (meBeforeLogout.status !== 200 || meBeforePayload?.data?.role !== account.role) {
        throw new Error(`/api/users/me returned the wrong role for ${account.role}`)
      }

      const { response: logoutResponse, payload: logoutPayload } = await fetchJson('/api/auth/logout', jar, {
        method: 'POST',
      })
      if (logoutResponse.status !== 200 || logoutPayload?.success !== true) {
        throw new Error(`Logout failed for ${account.role}`)
      }

      const { response: meAfterLogout } = await fetchJson('/api/users/me', jar)
      if (meAfterLogout.status !== 401) {
        throw new Error(`/api/users/me remained authenticated after logout for ${account.role}`)
      }

      const dashboardAfterLogout = await fetchPage(account.dashboardPath, jar)
      if (dashboardAfterLogout.status !== 307 || !dashboardAfterLogout.headers.get('location')?.startsWith('/login')) {
        throw new Error(`Protected route still accessible after logout for ${account.role}`)
      }

      results.push({
        ok: true,
        role: account.role,
        loginRedirect: loginRedirect.headers.get('location'),
        switchPageStatus: switchPage.status,
        logoutStatus: logoutResponse.status,
      })
    } catch (error) {
      results.push({ ok: false, role: account.role, error: error.message })
    }
  }

  console.log(JSON.stringify(results, null, 2))
  if (results.some(result => !result.ok)) {
    process.exit(1)
  }
})().catch(error => {
  console.error(error)
  process.exit(1)
})
