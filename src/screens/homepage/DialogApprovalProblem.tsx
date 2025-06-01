import { useNavigate } from 'react-router-dom';
import { handleLogoutAndUnsubscribeStates } from '~/lib/helpers';
import { Button } from '~/components/ui/button';
import { TriangleAlert } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

export function DialogApprovalProblem() {
  const navigate = useNavigate();

  return (
    <Dialog
      defaultOpen={true}
      onOpenChange={() => navigate(-1)}
    >
      <DialogContent
        hideCloseButton
        className="sm:max-w-[500px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <TriangleAlert color="red" />
            Approval bermasalah
          </DialogTitle>
        </DialogHeader>
        <section className="flex w-full flex-col items-center justify-center">
          <img
            src="/assets/approval-problem.png"
            alt="Error Boundary Image"
            className="w-[200px]"
          />
          <h1 className="text-center">
            Order tidak dapat dilanjutkan karena ada material
            yang melebihi batas toleransi. Hubungi
            supervisor untuk dapat melanjutkan order
          </h1>
        </section>
        <DialogFooter className="flex items-center justify-center">
          <Button
            onClick={() =>
              handleLogoutAndUnsubscribeStates()
            }
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
