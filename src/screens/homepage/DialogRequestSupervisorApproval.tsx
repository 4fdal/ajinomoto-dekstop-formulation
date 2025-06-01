import { TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '~/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

export function DialogRequestSupervisorApproval() {
  const navigate = useNavigate();
  return (
    <Dialog
      defaultOpen={true}
      onOpenChange={() => navigate(-1)}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <TriangleAlert color="red" />
            Penimbangan bermasalah!
          </DialogTitle>
        </DialogHeader>
        <section className="flex w-full flex-col items-center justify-center">
          <img
            src="/assets/approval-problem.png"
            alt="Error Boundary Image"
            className="w-[200px]"
          />
          <h1 className="text-center">
            Nilai Timbangan Diluar Toleransi Maksimum.
            Hubungi Supervisor Untuk Melanjutkan
            Penimbangan.
          </h1>
        </section>
        <DialogFooter className="flex items-center justify-end">
          <Button
            onClick={() => navigate(-1)}
            className="w-full bg-red-500 py-3 text-[15px] text-white hover:bg-red-400"
            type="submit"
          >
            Keluar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
