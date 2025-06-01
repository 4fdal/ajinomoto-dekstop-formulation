import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { encodeObjectToBase64 } from '~/lib/helpers';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { FormulationLine } from '~/lib/types/responses';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  FileMinus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import {
  deleteMasterFormulation,
  getFormulationById,
} from '~/actions/formulation.action';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';

const fields = [
  {
    label: 'Formulation Name',
    id: 'formulationName',
    value: 'formulationName',
  },
  {
    label: 'Total Ingredients',
    id: 'totalIngredient',
    value: 'totalIngredient',
  },
  {
    label: 'Status',
    id: 'status',
    value: 'status',
  },
  {
    label: 'Formulation Code',
    id: 'formulationCode',
    value: 'formulationCode',
  },
  {
    label: 'Total Mass',
    id: 'totalMass',
    value: 'totalMass',
  },
  {
    label: 'Must Follow Order',
    id: 'mustFollowOrder',
    value: 'mustFollowOrder',
  },
] as const;

export function DialogDetailFormulation({
  back,
}: {
  back: () => void;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearch] = useSearchParams();
  const idDelete = searchParams.get('id_delete');
  const idDetail = searchParams.get('id_detail');

  const { data } = useQuery({
    queryKey: ['formulation-by-id'],
    queryFn: () => getFormulationById(idDetail as string),
  });

  const handleEditFormulations = () => {
    const encodedObj = encodeObjectToBase64(data);
    navigate(
      `/formulations?edit_formulation=true&q=${encodedObj}`,
    );
  };

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="min-h-[600px] min-w-[1200px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            <FileMinus />
            Detail Formulation
          </AlertDialogTitle>
          <AlertDialogDescription>
            Click edit to go to edit page or navigate
            between detail formulations
          </AlertDialogDescription>
          <div className="flex flex-col justify-between gap-5">
            <section className="flex w-full justify-between gap-2">
              <div className="flex w-full flex-col space-y-2">
                {fields.slice(0, 3).map((field, index) => (
                  <div key={index}>
                    <Label
                      className="text-black"
                      htmlFor={field.id}
                    >
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      readOnly
                      value={
                        field.value === 'status'
                          ? data?.[field.value] === 1
                            ? 'Archived'
                            : data?.[field.value] === 0
                              ? 'Active'
                              : ''
                          : data?.[field.value] || ''
                      }
                      className="border-gray-300 disabled:border disabled:text-black"
                    />
                  </div>
                ))}
              </div>

              <div className="w-full flex-col space-y-2">
                {fields.slice(3).map((field, index) => (
                  <div key={index}>
                    <Label
                      className="text-black"
                      htmlFor={field.id}
                    >
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      readOnly
                      value={
                        field?.value == 'mustFollowOrder'
                          ? data?.[field?.value]
                            ? 'true'
                            : false
                          : data?.[field.value] || ''
                      }
                      className="border-black-300 disabled:border disabled:text-black"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="h-[210px] overflow-x-auto">
              <Table>
                <TableCaption>
                  {data?.FormulationLines?.length == 0
                    ? 'You have not any formulation lines'
                    : ' A list of your recorded datas.'}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Code</TableHead>
                    <TableHead>Material Name</TableHead>
                    <TableHead className="w-[200px]">
                      Instruction
                    </TableHead>
                    <TableHead>Type Tolerance</TableHead>
                    <TableHead className="text-center">
                      Tolerance Grouping
                    </TableHead>
                    <TableHead>Max</TableHead>
                    <TableHead>Min</TableHead>
                    <TableHead className="text-right">
                      Max Allowed W
                    </TableHead>
                    <TableHead className="text-right">
                      Target Mass
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.FormulationLines?.map(
                    (
                      item: FormulationLine,
                      idx: number,
                    ) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {item.productName}
                        </TableCell>
                        <TableCell>
                          {item.productCode}
                        </TableCell>
                        <TableCell>
                          {item.instruction}
                        </TableCell>
                        <TableCell>
                          {item.toleranceType}
                        </TableCell>
                        <TableCell className="flex justify-center text-center">
                          <Badge
                            className={cn(
                              'bg-green-200 text-green-500',
                              {
                                'bg-red-200 text-red-500':
                                  !item.implementToleranceGrouping,
                              },
                            )}
                          >
                            {item.implementToleranceGrouping
                              ? 'true'
                              : 'false'}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.max}</TableCell>
                        <TableCell>{item.min}</TableCell>
                        <TableCell className="text-right">
                          {item.maxAllowedWeighingQty}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.targetMass}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </section>
          </div>
        </AlertDialogHeader>
        <div className="flex w-full items-end justify-between">
          <div className="flex gap-3">
            <div className="cursor-pointer rounded-full bg-blue-200 p-2">
              <ChevronLeft className="text-blue-400" />
            </div>

            <div className="cursor-pointer rounded-full bg-blue-200 p-2">
              <ChevronRight className="text-blue-400" />
            </div>
          </div>

          <div className="flex gap-2">
            <AlertDialogCancel
              className="w-[100px] border-blue-500 text-blue-400 hover:bg-blue-300 hover:text-blue-500"
              onClick={() => back()}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="w-[100px] bg-blue-500 hover:bg-blue-400"
              onClick={handleEditFormulations}
            >
              Edit
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
