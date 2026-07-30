import Skeleton from "@/components/Skeleton";

export default function LoadingPractice() {
  return (
    <>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-44 mt-3" />
      <Skeleton className="h-4 w-80 mt-3" />

      <div className="mt-6 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-white px-4 py-3.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-14 mt-2" />
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white border border-line rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-11 w-44 rounded-full hidden md:block" />
        </div>
      </div>

      <Skeleton className="h-6 w-24 mt-8" />
      <div className="mt-3 bg-white border border-line rounded-2xl md:rounded-3xl overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-line last:border-0 flex items-center gap-4">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </>
  );
}
