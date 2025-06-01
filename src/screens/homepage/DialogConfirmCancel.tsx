import { Button } from '~/components/ui/button';
import { TriangleAlert, ScanBarcode, X } from 'lucide-react';
import { useState } from 'react';

import {
  useFormulationReport,
  useUserAuthStore,
} from '~/lib/store/store';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

export function DialogConfirmCancel() {
  const [isOpen, setIsOpen] = useState(false);
  const { setIsUserScanMaterialReports } = useUserAuthStore() // prettier-ignore

  const {
    setSelectedFormulationReportLines,
    setFormulationReports,
    setScanProductCode,
    setIsReadyToStartWeighing,
    setMustFollowOrder,
    setIsDoneAllRawMaterials,
  } = useFormulationReport();

  return (
    <Dialog open={isOpen}>
      <DialogTrigger
        asChild
        onClick={() => setIsOpen(true)}
      >
        <div className="cursor-pointer rounded-full bg-red-100 p-2">
          <X color="red" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <TriangleAlert color="red" />
            Are you sure?
          </DialogTitle>
          <DialogDescription>
            Back to scan barcode, your change cannot be
            undone
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="w-[90px] border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-500"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-[90px] bg-red-500 hover:bg-red-400"
            onClick={() => {
              setIsUserScanMaterialReports(false);
              setSelectedFormulationReportLines({});
              setFormulationReports([]);
              setScanProductCode('');
              setIsReadyToStartWeighing(false);
              setMustFollowOrder(false);
              setIsDoneAllRawMaterials(false);
            }}
          >
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
