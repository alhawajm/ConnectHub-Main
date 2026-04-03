#!/usr/bin/env node

/**
 * Seed demo accounts into Supabase
 * Run this once to create demo user accounts and profiles
 * Usage: node --env-file=.env.local scripts/seed-demo-accounts.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DEMO_ACCOUNTS = [
  {
    email: 'hr@techmark.bh',
    password: 'TechMark2026!',
    role: 'employer',
    full_name: 'HR Manager - TechMark',
  },
  {
    email: 'yusuf@email.bh',
    password: 'Seeker2026!',
    role: 'seeker',
    full_name: 'Yusuf Al-Khudairi',
  },
  {
    email: 'sara@designbh.com',
    password: 'Sara2026!',
    role: 'freelancer',
    full_name: 'Sara Al-Dosari',
  },
  {
    email: 'admin@connecthub.bh',
    password: 'Admin@2026!',
    role: 'admin',
    full_name: 'ConnectHub Admin',
  },
]

async function seedDemo() {
  console.log('🌱 Seeding demo accounts...')

  for (const account of DEMO_ACCOUNTS) {
    try {
      console.log(`\n📝 Processing ${account.role}: ${account.email}`)

      // Try to get existing user by email
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
      
      let authUser = users?.find(u => u.email === account.email)

      if (!authUser) {
        // Create auth user if it doesn't exist
        const { data, error: authError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
        })

        if (authError) {
          throw authError
        }
        authUser = data.user
        console.log(`   ✅ Auth user created: ${authUser.id}`)
      } else {
        console.log(`   ℹ️  Auth user already exists: ${authUser.id}`)
      }

      // Upsert profile (create or update)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: authUser.id,
            role: account.role,
            full_name: account.full_name,
            location: 'Bahrain',
            is_active: true,
          },
          { onConflict: 'id' }
        )

      if (profileError) {
        throw profileError
      }
      console.log(`   ✅ Profile configured with role: ${account.role}`)

      // Create role-specific profile
      if (account.role === 'employer') {
        const { error: empError } = await supabase
          .from('employer_profiles')
          .upsert(
            {
              id: authUser.id,
              company_name: 'TechMark Ltd.',
              company_size: '51-200',
              industry: 'Technology',
            },
            { onConflict: 'id' }
          )
        if (empError && !empError.message.includes('duplicate')) console.log(`   ℹ️  ${empError.message}`)
      } else if (account.role === 'seeker') {
        const { error: seekError } = await supabase
          .from('seeker_profiles')
          .upsert(
            {
              id: authUser.id,
              experience_years: 3,
              availability: 'available',
            },
            { onConflict: 'id' }
          )
        if (seekError && !seekError.message.includes('duplicate')) console.log(`   ℹ️  ${seekError.message}`)
      } else if (account.role === 'freelancer') {
        const { error: freelanceError } = await supabase
          .from('freelancer_profiles')
          .upsert(
            {
              id: authUser.id,
              hourly_rate: 75,
              availability: 'available',
            },
            { onConflict: 'id' }
          )
        if (freelanceError && !freelanceError.message.includes('duplicate')) console.log(`   ℹ️  ${freelanceError.message}`)
      }
    } catch (err) {
      console.error(`   ❌ Error:`, err.message)
    }
  }

  console.log('\n✅ Demo accounts seeded! You can now log in with:')
  console.log('')
  DEMO_ACCOUNTS.forEach(acc => {
    console.log(`  ${acc.role.padEnd(12)} | ${acc.email.padEnd(25)} | ${acc.password}`)
  })
  console.log('')
}

seedDemo().catch(err => {
  console.error('❌ Error:', err.message || err)
  process.exit(1)
})
