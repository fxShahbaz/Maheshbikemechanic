import Skeleton from "@/components/Skeleton";

export default function LoadingMaterialViewer() {
  return (
    <>
      <div className="flex items-start gap-3">
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40 mt-2" />
        </div>
      </div>
      <Skeleton className="mt-6 h-[70vh] max-w-3xl mx-auto rounded-xl" />
    </>
  );
}
