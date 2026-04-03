import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="page-wrapper flex min-h-screen items-center justify-center px-4 py-12">
      <div className="surface-card-strong w-full max-w-xl p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-2xl font-bold text-white shadow-lg">
          C
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#0099cc]">Error 404</p>
        <h1 className="mb-3 font-display text-5xl font-bold text-gray-900 dark:text-white">Page not found</h1>
        <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-gray-500 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist, may have moved, or is not available from your current route.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/">Back to Home</Button>
          <Button href="/login" variant="outline">Sign In</Button>
        </div>
      </div>
    </div>
  )
}
