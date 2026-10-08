import Skeleton from "@/components/Skeleton";

export default function LoadingUpdates() {
  return (
    <>
      <div className="pt-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <div className="mt-5 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white ring-1 ring-ink/[0.05] rounded-[28px] p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-24 w-full mt-4 rounded-[22px]" />
            <div className="mt-4 flex justify-between">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
