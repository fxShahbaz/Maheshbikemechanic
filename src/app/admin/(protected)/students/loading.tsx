import Skeleton from "@/components/Skeleton";

export default function LoadingStudents() {
  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-80 mt-3" />
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-white px-4 py-3.5"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20 mt-2" />
          </div>
        ))}
      </div>

      <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <Skeleton className="flex-1 md:w-64 h-9 rounded-xl" />
        </div>
      </div>

      <div className="mt-5 bg-white border border-line rounded-2xl md:rounded-3xl overflow-hidden">
        <div className="px-5 py-3 border-b border-line bg-cream/40 flex gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-20" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-5 py-4 border-b border-line last:border-0 flex items-center gap-6"
          >
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
