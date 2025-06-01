import { Button } from '~/components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { approveRejectReportLineAction } from '~/actions/formulation.action';
import { cn } from '~/lib/utils';
import { Ban } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  useFormulationReport,
  useUserDisplayStore,
} from '~/lib/store/store';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

export function DialogRejectFormulationReportLines({
  selectedFormulationReportLines,
  hidden,
}: {
  selectedFormulationReportLines: any;
  hidden: boolean;
}) {
  const [searchParams, setSearch] = useSearchParams();
  const currentSelectedItemIndexId = searchParams.get('item') // prettier-ignore
  const { setSelectedFormulationReportLines } = useFormulationReport(); // prettier-ignore
  const { isAdminScannedProductCode } = useUserDisplayStore(); // prettier-ignore

  const { mutate } = useMutation({
    mutationFn: () =>
      approveRejectReportLineAction({
        reportLineId: selectedFormulationReportLines.id, // prettier-ignore
        approvalStatus: false,
      }),

    onSuccess: (res) => {
      setSelectedFormulationReportLines(res.FormulationReportLines[currentSelectedItemIndexId!]) // prettier-ignore
      toast.success(
        'Formulation line successfully rejected!',
      );
    },

    onError: (err) => {
      console.log(err);
      toast.error(
        'Failed to reject formulation report line',
      );
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={
            !selectedFormulationReportLines.needApproval ||
            !isAdminScannedProductCode
          }
          className={cn(
            'flex gap-2 bg-red-500 hover:bg-red-400 disabled:bg-gray-500',
            {
              hidden,
            },
          )}
        >
          <Ban className="h-5 w-5" />
          Reject
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will
            permanently reject your formulation report
            lines.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border border-red-500 text-red-500 hover:text-red-400">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-400"
            onClick={() => mutate()}
          >
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
