export default function robots() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/auth/role'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  }
}
