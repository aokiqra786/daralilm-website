// Generic loading skeleton for portal pages. Rendered by route-segment
// loading.tsx files while the server component fetches its data, so the user
// sees structure immediately instead of a blank content area (the sidebar/
// layout stays put). Intentionally simple: a title bar, a stat row, and a list.
export default function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 rounded-lg bg-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-8 w-32 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="h-5 w-full rounded bg-slate-100" />
        ))}
      </div>
    </div>
  )
}
