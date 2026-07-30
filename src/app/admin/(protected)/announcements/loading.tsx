import Skeleton from "@/components/Skeleton";

export default function LoadingAnnouncements() {
  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-4 w-80 mt-3" />
      <div className="mt-8 bg-white border border-line rounded-3xl p-6 space-y-4">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <div className="mt-6 bg-white border border-line rounded-2xl md:rounded-3xl overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-line last:border-0 space-y-2">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-3 w-72" />
          </div>
        ))}
      </div>
    </main>
  );
}
