import Skeleton from "@/components/Skeleton";

/** Skeleton for a large-title page followed by a grouped list. */
export default function ListSkeleton({
  rows = 5,
  eyebrow = false,
  children,
}: {
  rows?: number;
  eyebrow?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="pt-2">
        {eyebrow && <Skeleton className="h-4 w-24 mb-2" />}
        <Skeleton className="h-9 w-40" />
      </div>
      {children}
      <Skeleton className="h-3 w-24 mt-8 mb-3 ml-1" />
      <div className="bg-white border border-line rounded-2xl overflow-hidden divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
