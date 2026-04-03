// Global loading page shown by Next.js during page transitions
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-display font-bold text-white text-xl shadow-lg shadow-brand-500/30 animate-pulse">
          C
        </div>
        {/* Spinner */}
        <svg className="animate-spin w-5 h-5 text-brand-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    </div>
  )
}
