import Skeleton from "@/components/Skeleton";

export default function LoadingUpdates() {
  return (
    <>
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-4 w-64 mt-3" />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-line rounded-3xl p-6">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4 mt-4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3 mt-1.5" />
          </div>
        ))}
      </div>
    </>
  );
}
