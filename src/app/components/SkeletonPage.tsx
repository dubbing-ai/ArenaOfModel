import { Skeleton } from '@/components/ui/skeleton';

function SkeletonPage({}: React.ComponentProps<"div">) {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Instructions skeleton */}
      <div className="mb-6">
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Top section skeleton */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-4 shadow">
          <Skeleton className="h-6 w-40 mb-3" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="border rounded-lg p-4 shadow">
          <Skeleton className="h-6 w-40 mb-3" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>

      {/* Table header skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16 mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto" />
      </div>

      {/* Sample rows skeleton */}
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="grid grid-cols-3 gap-4 items-center border rounded-lg p-4 shadow mb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-12 w-full rounded-md" />
          <div className="flex justify-center">
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      ))}

      {/* Button skeleton */}
      <div className="flex justify-end mt-6">
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </div>
  );
}

export {SkeletonPage};