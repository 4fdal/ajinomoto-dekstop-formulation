import { Skeleton } from '~/components/ui/skeleton';

export function TableSkeleton() {
  return (
    <div className="w-full border">
      <Skeleton className="h-5 w-full" />
    </div>
  );
}
