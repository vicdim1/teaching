export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    </div>
  )
}
