import { Skeleton } from '@/components/ui/skeleton';

function SkeletonPage({}: React.ComponentProps<"div">) {
  return (
    <div className="container mx-auto">
      <div className="w-full">
        {/* Comparison table header skeleton - matching the 3-column structure */}
        <div className="hidden sm:grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="text-left pl-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <div>
            <Skeleton className="h-6 w-24 mx-auto" />
          </div>
          <div>
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto mt-1" /> {/* For the smaller header text */}
          </div>
        </div>

        {/* Comparison rows skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6 ,7].map((i) => (
            <div 
              key={i} 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border rounded-lg p-5 shadow"
            >
              <div className="text-center md:text-left">
                <Skeleton className="h-5 w-32 md:ml-0 mx-auto md:mx-0" />
              </div>
              
              <div className="flex justify-center">
                <Skeleton className="h-12 w-full rounded-md max-w-md" /> {/* Audio player skeleton */}
              </div>

              <div className="flex justify-center">
                <Skeleton className="h-8 w-40" /> {/* Star rating skeleton */}
              </div>
            </div>
          ))}
        </div>

        {/* Button skeleton at the bottom (if needed) */}
        <div className="flex justify-end mt-6">
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export { SkeletonPage };