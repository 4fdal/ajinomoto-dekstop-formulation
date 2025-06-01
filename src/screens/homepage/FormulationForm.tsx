import { DialogClose } from '@radix-ui/react-dialog';
import {
  ChevronsUpDown,
  DoorClosed,
  ScanBarcode,
  TriangleAlert,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { AlertDialogHeader } from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { FormulationReportLine } from '~/lib/types/types';

export const FormulationForm = ({
  reportFormulationLines,
}: {
  reportFormulationLines:
    | FormulationReportLine[]
    | undefined;
}) => {
  const [openDialog, setOpenDialog] =
    React.useState<boolean>(false);

  const [
    selectFormulationReportLine,
    setSelectFormulationReportLine,
  ] = React.useState<FormulationReportLine>();

  return (
    <>
      <div className="flex flex-row justify-start gap-2">
        {/* <div
          onClick={() => setOpenDialog(true)}
          className="flex w-72 cursor-pointer flex-row items-center justify-between gap-5 rounded-xl border px-3 py-4 shadow-sm hover:bg-slate-100"
        >
          <span>
            {selectFormulationReportLine?.materialName ??
              'Formulation'}
          </span>
          <div className="cursor-pointer rounded-full">
            <ChevronsUpDown />
          </div>
        </div>
        <Dialog
          open={openDialog}
          onOpenChange={() => {
            setOpenDialog(false);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Select Formulation
              </DialogTitle>
              <DialogDescription>
                Start select formulation for weighing
              </DialogDescription>
            </DialogHeader>

            <div className='flex flex-col gap-2'>

            </div>

          </DialogContent>
        </Dialog> */}
      </div>
    </>
  );
};
