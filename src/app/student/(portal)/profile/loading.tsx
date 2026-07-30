import Skeleton from "@/components/Skeleton";

export default function LoadingProfile() {
  return (
    <>
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full shrink-0" />
        <div>
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-line rounded-3xl p-6">
            <Skeleton className="h-6 w-36" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex justify-between gap-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-white border border-line rounded-3xl p-6">
        <Skeleton className="h-6 w-20" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line px-4 py-3.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-20 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
