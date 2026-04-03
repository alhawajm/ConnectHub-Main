import { createServerClient } from '@/lib/supabaseServer'
import { Avatar, Badge } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import { formatDate, ROLE_LABELS } from '@/lib/utils'
import { notFound } from 'next/navigation'

function parsePortfolioData(raw) {
  const empty = {
    items: [],
    tagline: '',
    website: '',
    linkedin: '',
    github: '',
    phone: '',
    location: '',
    certifications: '',
    experiences: [],
    education: [],
  }

  if (!raw) return empty

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return { ...empty, items: parsed }
    return {
      ...empty,
      ...parsed,
      items: parsed.items || [],
      experiences: parsed.experiences || [],
      education: parsed.education || [],
    }
  } catch {
    return empty
  }
}

export async function generateMetadata({ params }) {
  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, headline')
    .eq('id', params.id)
    .single()

  return {
    title: profile?.full_name ? `${profile.full_name} - ConnectHub` : 'Profile - ConnectHub',
    description: profile?.headline || 'Professional profile on ConnectHub',
  }
}

export default async function PublicProfilePage({ params }) {
  const supabase = createServerClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (error || !profile) notFound()

  let roleProfile = null
  if (profile.role === 'freelancer') {
    const { data } = await supabase.from('freelancer_profiles').select('*').eq('id', params.id).single()
    roleProfile = data
  } else if (profile.role === 'seeker') {
    const { data } = await supabase.from('seeker_profiles').select('*').eq('id', params.id).single()
    roleProfile = data
  } else if (profile.role === 'employer') {
    const { data } = await supabase.from('employer_profiles').select('*').eq('id', params.id).single()
    roleProfile = data
  }

  const portfolio = parsePortfolioData(profile.portfolio_items)
  const portfolioItems = portfolio.items

  supabase.from('profiles').update({ views_count: (profile.views_count || 0) + 1 }).eq('id', params.id)

  const visibleLinks = [
    portfolio.website || profile.website,
    portfolio.linkedin || profile.linkedin_url,
    portfolio.github,
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-display font-bold text-white text-xs">C</div>
            <span className="font-display font-bold text-gray-900 dark:text-white text-sm">Connect<span className="text-brand-500">Hub</span></span>
          </a>
          <Button href="/register" size="sm">Join ConnectHub</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-5">
          <div className="flex items-start gap-4">
            <Avatar name={profile.full_name} size="xl" />
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">{profile.full_name}</h1>
                  {(portfolio.tagline || profile.headline) && (
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">{portfolio.tagline || profile.headline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={profile.role === 'employer' ? 'cyan' : profile.role === 'freelancer' ? 'purple' : 'green'}>
                      {ROLE_LABELS[profile.role]}
                    </Badge>
                    {(portfolio.location || profile.location) && <span className="text-xs text-gray-400">Location: {portfolio.location || profile.location}</span>}
                    {profile.is_verified && <span className="text-xs font-bold text-brand-500">Verified</span>}
                  </div>
                </div>

                {profile.role === 'freelancer' && roleProfile?.rating > 0 && (
                  <div className="text-right">
                    <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">{roleProfile.rating}</p>
                    <p className="text-xs text-gray-400">{roleProfile.review_count} reviews</p>
                    {roleProfile.hourly_rate && <p className="text-sm font-bold text-brand-500 mt-1">BD {roleProfile.hourly_rate}/hr</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-4 border-t border-gray-50 dark:border-gray-800 pt-4">
              {profile.bio}
            </p>
          )}

          {(visibleLinks.length > 0 || portfolio.phone) && (
            <div className="flex flex-wrap gap-3 mt-4 text-xs">
              {portfolio.phone && <span className="font-semibold text-gray-500 dark:text-gray-400">Phone: {portfolio.phone}</span>}
              {(portfolio.website || profile.website) && <a href={portfolio.website || profile.website} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 font-semibold">Website</a>}
              {(portfolio.linkedin || profile.linkedin_url) && <a href={portfolio.linkedin || profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 font-semibold">LinkedIn</a>}
              {portfolio.github && <a href={portfolio.github} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 font-semibold">GitHub</a>}
            </div>
          )}
        </div>

        {profile.skills?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
            <h2 className="font-display font-bold text-gray-900 dark:text-white mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill} className="px-3 py-1 rounded-full text-sm font-semibold bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.role === 'freelancer' && roleProfile?.categories?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
            <h2 className="font-display font-bold text-gray-900 dark:text-white mb-3">Services</h2>
            <div className="flex flex-wrap gap-2">
              {roleProfile.categories.map(cat => (
                <span key={cat} className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {portfolio.experiences.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
            <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">Experience</h2>
            <div className="space-y-4">
              {portfolio.experiences.map((item, index) => (
                <div key={`experience-${index}`} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.role || 'Role'}</h3>
                  <p className="text-sm text-brand-500 mt-1">{item.company || 'Company'}{item.period ? ` | ${item.period}` : ''}</p>
                  {item.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {portfolio.education.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
            <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">Education</h2>
            <div className="space-y-4">
              {portfolio.education.map((item, index) => (
                <div key={`education-${index}`} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.degree || 'Degree'}</h3>
                  <p className="text-sm text-brand-500 mt-1">{item.institution || 'Institution'}{item.year ? ` | ${item.year}` : ''}</p>
                  {item.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {portfolio.certifications && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
            <h2 className="font-display font-bold text-gray-900 dark:text-white mb-3">Certifications</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{portfolio.certifications}</p>
          </div>
        )}

        {portfolioItems.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
            <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">Portfolio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {portfolioItems.map(item => (
                <a key={item.id} href={item.url || '#'} target={item.url ? '_blank' : undefined} rel="noopener noreferrer" className="block border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:border-brand-200 dark:hover:border-brand-800 transition-colors">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</h3>
                  {item.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-gray-400">Updated {formatDate(item.created_at)}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-brand-500 to-cyan-400 rounded-2xl p-6 text-white text-center">
          <h2 className="font-display font-bold text-lg mb-1">Interested in working with {profile.full_name?.split(' ')[0]}?</h2>
          <p className="text-white/70 text-sm mb-4">Sign up to ConnectHub to send a message or hire them directly.</p>
          <Button href="/register" className="bg-white text-brand-600 hover:bg-gray-100">Get Started Free</Button>
        </div>
      </main>
    </div>
  )
}
