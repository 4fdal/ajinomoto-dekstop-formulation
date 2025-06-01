import { toast } from 'sonner';
import { cn } from '~/lib/utils';
import { Cloud } from 'lucide-react';

import {
  useUserAuthStore,
  useUserDisplayStore,
} from '~/lib/store/store';

export default function AuthNavigationBar() {
  const { isScaleConnected } = useUserDisplayStore();
  const { isAppConnected } = useUserAuthStore(
    (state) => state,
  );

  const handleClickCloud = () => {
    if (isAppConnected && isScaleConnected) {
      toast.success(
        'App connected, scale connection established!',
      );
    } else if (isAppConnected && !isScaleConnected) {
      toast.warning(
        'Could not establish scale connection!',
      );
    } else {
      toast.error('App dissconected');
    }
  };
  return (
    <div className="flex w-full items-center justify-between border-b px-4 pb-4 pt-5">
      <div>
        <h1 className="font-semibold">Prisma Form Pro</h1>
      </div>

      <div
        className="cursor-pointer"
        onClick={handleClickCloud}
      >
        <div
          className={cn('rounded-full bg-green-100 p-2', {
            'animate-pulse bg-red-100': !isAppConnected,
          })}
        >
          <Cloud
            color={isAppConnected ? '#22c55e' : '#ed0505'}
          />
        </div>
      </div>

      <div className="w-[100px]"></div>
    </div>
  );
}
