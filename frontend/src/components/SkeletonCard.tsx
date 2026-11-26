export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-slate-800 dark:bg-[#111827] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-4 h-7 w-32 rounded-md bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-3 w-20 rounded-md bg-slate-100 dark:bg-slate-800/70" />
    </div>
  );
}

export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex animate-pulse items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-36 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-24 rounded bg-slate-100 dark:bg-slate-800/70" />
            </div>
          </div>
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
