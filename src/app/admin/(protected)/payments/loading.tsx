import Skeleton from "@/components/Skeleton";

export default function LoadingPayments() {
  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-72 mt-3" />
        </div>
        <div className="grid grid-cols-4 gap-2 md:max-w-md md:w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-white px-3 py-2"
            >
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-6 w-16 mt-2" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <Skeleton className="h-9 w-full md:w-80 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-full" />
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
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
