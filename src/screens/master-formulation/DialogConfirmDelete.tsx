import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { deleteMasterFormulation } from '~/actions/formulation.action';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';

export function DialogConfirmDelete({
  back,
}: {
  back: () => void;
}) {
  const [searchParams, setSearch] = useSearchParams();
  const idDelete = searchParams.get('id_delete');
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () => deleteMasterFormulation(idDelete as string), // prettier-ignore
    onSuccess: (res) => {
      if (res !== undefined) {
        queryClient.invalidateQueries({
          queryKey: ['all-formulations'], // revalidate cached data
        });
        return toast.success(
          'Successfully delete formulation',
        );
      }

      back();
      toast.error('Failed to delete formulation');
    },
    onError: (err: any) => {
      console.log('error', err);
      toast.error(err?.response?.data?.message);
    },
  });
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-500">
            <Trash2 />
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will
            permanently delete your formulation and remove
            your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="border border-red-500 text-red-500 hover:text-red-400"
            onClick={() => back()}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-400"
            onClick={() => mutate()}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
