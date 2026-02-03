import { Skeleton } from "@/components/ui/skeleton"

export function LoadingCatalog() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Skeleton className="w-full aspect-square" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
