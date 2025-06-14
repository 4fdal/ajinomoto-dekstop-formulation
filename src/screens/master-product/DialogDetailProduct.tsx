import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

import { Input } from '~/components/ui/input';
import { FileBox } from 'lucide-react';
import { Label } from '~/components/ui/label';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMasterProductByIdAction } from '~/actions/masters.action';

export function DialogDetailProduct({
  back,
}: {
  back: () => void;
}) {
  const [searchParams, setSearch] = useSearchParams();
  const productId = searchParams.get('product_id');

  const { data } = useQuery({
    queryKey: ['master_product_by_id'],
    queryFn: () => getMasterProductByIdAction(productId!),
  });

  return (
    <Dialog open onOpenChange={back}>
      <DialogContent className="min-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileBox />
            Detail Material
          </DialogTitle>
          <DialogDescription>
            Detail weight material
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col space-y-2">
          <div>
            <Label htmlFor="product_code">
              Material Code
            </Label>
            <Input
              readOnly
              value={data?.code}
              type="text"
              id="product_code"
              placeholder="Material Code"
            />
          </div>

          <div>
            <Label htmlFor="product_name">
              Material Name
            </Label>
            <Input
              readOnly
              value={data?.name}
              type="text"
              id="product_name"
              placeholder="Material Name"
            />
          </div>

          <div>
            <Label htmlFor="unit">Units</Label>
            <Input
              readOnly
              value={data?.Unit?.name}
              type="text"
              id="unit"
              placeholder="Unit"
            />
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
