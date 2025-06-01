import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import {
  useFormulationReport,
  useUserDisplayStore,
} from '~/lib/store/store';
import { useSearchParams } from 'react-router-dom';
import { approveRejectReportLineAction } from '~/actions/formulation.action';
import { CircleCheckBig } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

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

export function DialogApproveFormulationReportLines({
  selectedFormulationReportLines,
  hidden,
}: {
  selectedFormulationReportLines: any;
  hidden: boolean;
}) {
  const [searchParams, setSearch] = useSearchParams();
  const currentSelectedItemIndexId = searchParams.get('item') // prettier-ignore
  const { setSelectedFormulationReportLines, setFormulationReports } = useFormulationReport(); // prettier-ignore
  const { isAdminScannedProductCode } = useUserDisplayStore(); // prettier-ignore

  const { mutate } = useMutation({
    mutationFn: () =>
      approveRejectReportLineAction({
        reportLineId: selectedFormulationReportLines.id, // prettier-ignore
        approvalStatus: true,
      }),

    onSuccess: (res) => {
      setFormulationReports(res.FormulationReportLines);
      setSelectedFormulationReportLines(res.FormulationReportLines[currentSelectedItemIndexId!]) // prettier-ignore

      toast.success(
        'Formulation line successfully approved!',
      );
    },

    onError: (err) => {
      console.log(err);
      toast.error(
        'Failed to approve formulation report line',
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
            'flex gap-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-500',
            {
              hidden,
            },
          )}
        >
          <CircleCheckBig className="h-5 w-5" />
          Approve
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will
            permanently approve your formulation report
            lines.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border border-green-500 text-green-500 hover:text-green-400">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-green-500 hover:bg-green-400"
            onClick={() => mutate()}
          >
            Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
