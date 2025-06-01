import { toast } from 'sonner';
import { cn } from '~/lib/utils';
import { handleLogoutAndUnsubscribeStates } from '~/lib/helpers';
import { Cloud, LogOut } from 'lucide-react';
import { Button } from '~/components/ui/button';

import {
  useUserAuthStore,
  useUserDisplayStore,
} from '~/lib/store/store';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

export default function Navbar() {
  const { isAppConnected, user } = useUserAuthStore() // prettier-ignore
  const { isScaleConnected } = useUserDisplayStore();

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
    <div className="absolute right-0 top-0 flex w-full items-center justify-between border-b pb-4 pl-[100px] pr-4 pt-5">
      <div>
        <h1 className="font-semibold">Prisma Form Pro</h1>
      </div>

      <div
        className="flex cursor-pointer gap-3"
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

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-[35px] min-w-[100px] bg-blue-500 hover:bg-blue-400">
              {user.username || 'unknown'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52">
            <DropdownMenuLabel>
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                handleLogoutAndUnsubscribeStates()
              }
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
