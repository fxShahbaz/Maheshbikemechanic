import Skeleton from "@/components/Skeleton";

export default function LoadingEngines() {
  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-4 w-96 mt-3" />
      <div className="mt-8 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="mt-4 bg-white border border-line rounded-2xl md:rounded-3xl overflow-hidden">
        <div className="px-5 py-3 border-b border-line bg-cream/40 flex gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-20" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="px-5 py-4 border-b border-line last:border-0 flex items-center gap-6"
          >
            <Skeleton className="h-4 w-44 flex-1" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 hidden md:block" />
          </div>
        ))}
      </div>
    </main>
  );
}
