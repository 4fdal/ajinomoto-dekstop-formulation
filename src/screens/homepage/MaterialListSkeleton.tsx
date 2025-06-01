import { Skeleton } from '~/components/ui/skeleton';

export function MaterialListSkeleton() {
  const arr = [1, 2, 3];
  return (
    <>
      {arr.map((_, idx) => (
        <div
          key={idx}
          className="mt-3 flex h-[140px] items-center space-x-4 rounded-md border p-4"
        >
          <Skeleton className="h-[70px] w-[70px] rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[230px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </>
  );
}
