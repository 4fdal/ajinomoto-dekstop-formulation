import { Button } from '~/components/ui/button';
import { deleteMasterUser } from '~/actions/masters.action';
import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

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
  const idUser = searchParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () => deleteMasterUser(idUser as string), // prettier-ignore
    onSuccess: (res) => {
      navigate(-1);
      if (res.data) {
        toast.success('Successfully delete user');
        queryClient.invalidateQueries({
          queryKey: ['master_users'], // revalidate cached data
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
            Delete user, your change cannot be undone
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
