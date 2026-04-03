export default function sitemap() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const now = new Date()
  const routes = [
    '',
    '/jobs',
    '/freelance',
    '/pricing',
    '/career-guidance',
    '/recruitment-counselling',
    '/business-continuity',
    '/portfolio-builder',
    '/contact',
    '/help',
    '/privacy',
    '/terms',
    '/login',
    '/register',
    '/test-accounts',
  ]

  return routes.map(route => ({
    url: `${appUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
