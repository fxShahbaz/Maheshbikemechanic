import Skeleton from "@/components/Skeleton";
import ListSkeleton from "../_components/ListSkeleton";

export default function LoadingPractice() {
  return (
    <ListSkeleton rows={4} eyebrow>
      <div className="mt-4 bg-white border border-line rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-2xl mt-5" />
      </div>
      <div className="mt-4 bg-white border border-line rounded-2xl grid grid-cols-3 divide-x divide-line">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-3 py-3.5 flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </ListSkeleton>
  );
}
