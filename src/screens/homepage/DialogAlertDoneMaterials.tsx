import { CheckCheck } from 'lucide-react';

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

export function DialogAlertDoneMaterials() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogTitle className="hidden"></AlertDialogTitle>
        <AlertDialogDescription className="flex flex-col items-center justify-center text-center">
          <img
            src="/assets/rm-done.png"
            alt="Row Materials Done"
            className="w-[270px]"
          />
          <h1 className="font-semibold">
            All Materials are already{' '}
            <span className="text-green-500">done</span>.
            Execute another materials or simply close this
            notification
          </h1>
        </AlertDialogDescription>
        <AlertDialogFooter className="flex items-center justify-center">
          <AlertDialogCancel className="w-full">
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
