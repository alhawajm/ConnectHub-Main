export default function DashboardLoading() {
  return (
    <div className="dashboard-layout flex min-h-screen items-center justify-center px-4">
      <div className="surface-card-strong w-full max-w-md p-8 text-center">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-[linear-gradient(135deg,#00cffd_0%,#0099cc_100%)]" />
        <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">Loading Dashboard</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Pulling in your latest platform activity.
        </p>
      </div>
    </div>
  )
}
