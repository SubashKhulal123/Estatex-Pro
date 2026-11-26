// Reusable skeleton shapes
export const SkeletonBox = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
)

export const SkeletonText = ({ className = '' }) => (
  <div className={`skeleton h-4 rounded ${className}`} />
)

export const SkeletonCard = () => (
  <div className="glass-card overflow-hidden">
    <SkeletonBox className="h-48" />
    <div className="p-4 space-y-2">
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-1/2" />
      <SkeletonText className="w-full" />
    </div>
  </div>
)

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="glass-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i}><SkeletonText className="w-20" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, r) => (
            <tr key={r}>
              {[...Array(cols)].map((_, c) => (
                <td key={c}><SkeletonText className={c === 0 ? 'w-36' : 'w-24'} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export const SkeletonStats = ({ count = 4 }) => (
  <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="stat-card space-y-3">
        <SkeletonBox className="w-10 h-10" />
        <SkeletonText className="w-16 h-7" />
        <SkeletonText className="w-24" />
      </div>
    ))}
  </div>
)

export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-orange-500/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-slate-500 text-sm">Loading…</p>
    </div>
  )
}
