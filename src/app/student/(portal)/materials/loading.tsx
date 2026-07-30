import Skeleton from "@/components/Skeleton";

export default function LoadingMaterials() {
  return (
    <>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-80 mt-3" />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-line rounded-3xl p-6">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <Skeleton className="h-5 w-4/5 mt-4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-16 mt-4" />
          </div>
        ))}
      </div>
    </>
  );
}
