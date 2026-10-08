import Skeleton from "@/components/Skeleton";

export default function LoadingProfile() {
  return (
    <>
      <div className="pt-4 flex flex-col items-center">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-7 w-44 mt-3" />
        <Skeleton className="h-4 w-56 mt-2" />
        <Skeleton className="h-6 w-28 rounded-full mt-2" />
      </div>
      {[2, 6, 3].map((rows, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-20 mt-8 mb-3 ml-1" />
          <div className="bg-white border border-line rounded-2xl overflow-hidden divide-y divide-line">
            {Array.from({ length: rows }).map((_, j) => (
              <div key={j} className="px-4 py-3.5 flex justify-between gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
