import Skeleton from "@/components/Skeleton";

export default function LoadingMaterials() {
  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-4 w-80 mt-3" />
      <div className="mt-8 bg-white border border-line rounded-3xl p-6">
        <Skeleton className="h-6 w-36" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="mt-6 bg-white border border-line rounded-2xl md:rounded-3xl overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-line last:border-0 space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-64" />
          </div>
        ))}
      </div>
    </main>
  );
}
