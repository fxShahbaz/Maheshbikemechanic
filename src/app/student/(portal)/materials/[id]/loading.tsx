import Skeleton from "@/components/Skeleton";

export default function LoadingMaterialViewer() {
  return (
    <>
      <Skeleton className="h-5 w-16 mt-2" />
      <Skeleton className="h-6 w-64 mt-3" />
      <Skeleton className="h-4 w-40 mt-2" />
      <Skeleton className="mt-4 h-[70vh] rounded-xl" />
    </>
  );
}
