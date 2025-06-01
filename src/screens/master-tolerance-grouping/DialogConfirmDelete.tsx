import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { deleteMasterToleranceGrouping } from '~/actions/tolerance.action';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

export function DialogConfirmDelete() {
  const [searchParams, setSearch] = useSearchParams();
  const idToleranceGrouping = searchParams.get('delete_id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () => deleteMasterToleranceGrouping(idToleranceGrouping), // prettier-ignore
    onSuccess: (res) => {
      console.log('res', res);
      navigate(-1);
      if (res.data) {
        toast.success(
          'Successfully delete tolerance grouping',
        );
        queryClient.invalidateQueries({
          queryKey: ['master_tolerance_groupings'], // revalidate cached data
        });
      } else {
        toast.error(res?.response?.data?.message);
      }
    },
    onError: (err) => console.log(err),
  });

  return (
    <Dialog defaultOpen>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <Trash2 color="red" />
            Are you sure?
          </DialogTitle>
          <DialogDescription>
            Delete tolerance grouping, your change cannot be
            undone
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="w-[90px] border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-500"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-[90px] bg-red-500 hover:bg-red-400"
            onClick={() => mutate()}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
