import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-gray-950">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 font-display text-2xl font-bold text-white shadow-lg shadow-brand-500/30">
        C
      </div>
      <h1 className="mb-2 font-display text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mb-2 font-display text-xl font-bold text-gray-600 dark:text-gray-400">Page not found</p>
      <p className="mb-8 max-w-sm text-gray-400 dark:text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button href="/">Back to Home</Button>
        <Button href="/login" variant="ghost">Sign In</Button>
      </div>
    </div>
  )
}