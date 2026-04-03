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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const accounts = [
  {
    role: 'employer',
    email: 'hr@techmark.bh',
    password: 'TechMark2026!',
    dashboardPath: '/dashboard/employer',
    checks: async (client, session) => {
      const userId = session.user.id
      const { data: jobs, error: jobsError } = await client
        .from('jobs')
        .select('*')
        .eq('employer_id', userId)

      if (jobsError) throw jobsError
      if (!jobs?.length) throw new Error('Employer has no jobs')

      const { data: applications, error: appsError } = await client
        .from('applications')
        .select('*, jobs(title), profiles!applications_seeker_id_fkey(full_name)')
        .in('job_id', jobs.map(job => job.id))

      if (appsError) throw appsError
      if (!applications?.length) throw new Error('Employer has no candidate applications')

      return {
        jobs: jobs.length,
        applications: applications.length,
      }
    },
    apiChecks: async headers => {
      const me = await fetchJson('/api/users/me', headers)
      const apps = await fetchJson('/api/applications', headers)
      if (me.data?.role !== 'employer') throw new Error('Employer role mismatch from /api/users/me')
      if (!Array.isArray(apps.data) || !apps.data.length) throw new Error('Employer /api/applications returned no data')
      return { apiApplications: apps.data.length }
    },
  },
  {
    role: 'seeker',
    email: 'yusuf@email.bh',
    password: 'Seeker2026!',
    dashboardPath: '/dashboard/seeker',
    checks: async (client, session) => {
      const userId = session.user.id
      const [profileRes, applicationsRes, jobsRes] = await Promise.all([
        client.from('profiles').select('*').eq('id', userId).single(),
        client.from('applications').select('*, jobs(title)').eq('seeker_id', userId),
        client.from('jobs').select('*').eq('status', 'active').limit(10),
      ])

      for (const result of [profileRes, applicationsRes, jobsRes]) {
        if (result.error) throw result.error
      }

      if (!applicationsRes.data?.length) throw new Error('Seeker has no applications')
      if (!jobsRes.data?.length) throw new Error('No active jobs available for seeker')

      return {
        applications: applicationsRes.data.length,
        activeJobs: jobsRes.data.length,
      }
    },
    apiChecks: async headers => {
      const me = await fetchJson('/api/users/me', headers)
      const apps = await fetchJson('/api/applications', headers)
      const dashboard = await fetchJson('/api/seeker-data', headers)
      if (me.data?.role !== 'seeker') throw new Error('Seeker role mismatch from /api/users/me')
      if (!Array.isArray(apps.data) || !apps.data.length) throw new Error('Seeker /api/applications returned no data')
      if (!Array.isArray(dashboard.data?.savedJobs) || !dashboard.data.savedJobs.length) throw new Error('Seeker dashboard API returned no saved jobs')
      return { apiApplications: apps.data.length, apiSavedJobs: dashboard.data.savedJobs.length }
    },
  },
  {
    role: 'freelancer',
    email: 'sara@designbh.com',
    password: 'Sara2026!',
    dashboardPath: '/dashboard/freelancer',
    checks: async (client, session) => {
      const userId = session.user.id
      const [profileRes, proposalsRes] = await Promise.all([
        client.from('profiles').select('*').eq('id', userId).single(),
        client.from('proposals').select('*, projects(title)').eq('freelancer_id', userId),
      ])

      for (const result of [profileRes, proposalsRes]) {
        if (result.error) throw result.error
      }

      if (!proposalsRes.data?.length) throw new Error('Freelancer has no proposals')

      return {
        proposals: proposalsRes.data.length,
      }
    },
    apiChecks: async (headers, session) => {
      const dashboard = await fetchJson('/api/freelancer/dashboard', {
        ...headers,
        Authorization: `Bearer ${session.access_token}`,
      })
      if (!dashboard.data?.contracts?.length) throw new Error('Freelancer dashboard API returned no contracts')
      return {
        apiContracts: dashboard.data.contracts.length,
        apiEscrowRows: dashboard.data.escrowRows?.length || 0,
      }
    },
  },
  {
    role: 'admin',
    email: 'admin@connecthub.bh',
    password: 'Admin@2026!',
    dashboardPath: '/dashboard/admin',
    checks: async client => {
      const [profilesRes, jobsRes, projectsRes, disputesRes] = await Promise.all([
        client.from('profiles').select('id, role'),
        client.from('jobs').select('id, status'),
        client.from('projects').select('id, status'),
        client.from('disputes').select('id, status'),
      ])

      for (const result of [profilesRes, jobsRes, projectsRes, disputesRes]) {
        if (result.error) throw result.error
      }

      if (!profilesRes.data?.length) throw new Error('Admin cannot read profiles')

      return {
        profiles: profilesRes.data.length,
        jobs: jobsRes.data.length,
        projects: projectsRes.data.length,
        disputes: disputesRes.data.length,
      }
    },
    apiChecks: async headers => {
      const me = await fetchJson('/api/users/me', headers)
      if (me.data?.role !== 'admin') throw new Error('Admin role mismatch from /api/users/me')
      return { role: me.data.role }
    },
  },
]

async function fetchJson(path, headers, attempt = 1) {
  const response = await fetch(`${APP_URL}${path}`, { headers, cache: 'no-store' })
  const text = await response.text()
  let payload

  try {
    payload = JSON.parse(text)
  } catch {
    const looksLikeHtml = /^\s*<!DOCTYPE html/i.test(text)
    if (looksLikeHtml && attempt < 3) {
      await sleep(500 * attempt)
      return fetchJson(path, headers, attempt + 1)
    }

    throw new Error(`${path} returned non-JSON response: ${text.slice(0, 120)}`)
  }

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}: ${payload.error || text}`)
  }

  return payload
}

async function fetchPage(path, headers) {
  const response = await fetch(`${APP_URL}${path}`, {
    headers,
    redirect: 'manual',
  })

  const text = await response.text()

  if (response.status >= 400) {
    throw new Error(`${path} failed with ${response.status}`)
  }

  const location = response.headers.get('location')
  return {
    status: response.status,
    location,
    text,
  }
}

function createAuthHeaders(session) {
  const cookiePayload = encodeURIComponent(
    JSON.stringify([
      session.access_token,
      session.refresh_token,
      session.provider_token || null,
      session.provider_refresh_token || null,
      session.user?.factors || null,
    ])
  )

  return {
    Cookie: `${authCookieName}=${cookiePayload}`,
  }
}

async function runRoleJourney(account) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const signInResult = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  })

  if (signInResult.error) throw signInResult.error

  const session = signInResult.data.session
  const headers = createAuthHeaders(session)

  const directChecks = await account.checks(client, session)
  const apiChecks = await account.apiChecks(headers, session)
  const dashboardPage = await fetchPage(account.dashboardPath, headers)
  const crossRolePage = await fetchPage('/dashboard/admin', headers)

  if (dashboardPage.status !== 200 || !dashboardPage.text.includes('ConnectHub')) {
    throw new Error(`${account.dashboardPath} did not render expected app shell`)
  }

  if (account.role === 'admin') {
    if (crossRolePage.status !== 200) {
      throw new Error('Admin dashboard page did not render for admin session')
    }
  } else if (crossRolePage.status !== 307 || crossRolePage.location !== account.dashboardPath) {
    throw new Error(`Cross-role guard failed for ${account.role}`)
  }

  return {
    role: account.role,
    directChecks,
    apiChecks,
    pageChecks: {
      dashboardStatus: dashboardPage.status,
      crossRoleStatus: crossRolePage.status,
      crossRoleLocation: crossRolePage.location,
    },
  }
}

;(async () => {
  const results = []
  for (const account of accounts) {
    try {
      const result = await runRoleJourney(account)
      results.push({ ok: true, ...result })
    } catch (error) {
      results.push({ ok: false, role: account.role, error: error.message })
    }
  }

  const failed = results.filter(item => !item.ok)
  console.log(JSON.stringify(results, null, 2))

  if (failed.length) {
    process.exit(1)
  }
})().catch(error => {
  console.error(error)
  process.exit(1)
})
