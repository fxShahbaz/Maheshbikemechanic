import Skeleton from "@/components/Skeleton";

export default function LoadingDashboard() {
  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-4 w-64 mt-3" />
        </div>
        <Skeleton className="h-3 w-40" />
      </div>

      <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-white px-4 py-4"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-12 mt-3" />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="mt-3 rounded-2xl border border-line bg-white overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-4 border-b border-line last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
