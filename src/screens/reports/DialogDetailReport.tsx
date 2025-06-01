import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { encodeObjectToBase64 } from '~/lib/helpers';
import { DialogReportLogger } from './DialogReportLogger';
import { getReportFormulationById } from '~/actions/reports.action';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { FormulationLine } from '~/lib/types/responses';
import { useState } from 'react';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  FileMinus,
  ChevronLeft,
  ChevronRight,
  BarChartHorizontal,
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
    id: 'name',
    value: 'formulationName',
  },
  {
    label: 'Total Ingredients',
    id: 'totalIngredients1',
    value: 'totalIngredient',
  },
  {
    label: 'Status',
    id: 'totalIngredients2',
    value: 'status',
  },
  {
    label: 'Formulation Code',
    id: 'code',
    value: 'formulationCode',
  },
  {
    label: 'Multiplier',
    id: 'multiplier',
    value: 'multiplier',
  },
  {
    label: 'Must Follow Order',
    id: 'mustFollowOrder',
    value: 'mustFollowOrder',
  },
] as const;

export function DialogDetailReport({
  back,
}: {
  back: () => void;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearch] = useSearchParams();
  const [isShowReportLogger, setIsShowReportLogger] = useState(false) // prettier-ignore
  const idDelete = searchParams.get('id_delete');
  const idDetail = searchParams.get('id_detail');

  const { data } = useQuery({
    queryKey: ['report-by-id'],
    queryFn: () =>
      getReportFormulationById(idDetail as string),
  });

  const getStatusReport = (no: number) => {
    switch (no) {
      case 0:
        return 'Waiting implementation';
      case 1:
        return 'On Progress';
      case 2:
        return 'Completed';
      case 3:
        return 'Aborted';

      default:
        break;
    }
  };

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="min-h-[600px] min-w-[1200px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            <FileMinus />
            Reports
          </AlertDialogTitle>
          <AlertDialogDescription>
            Detail report formulation
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
                          ? getStatusReport(
                              data?.[field.value],
                            )
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

            <section className="mt-2 min-h-[200px] rounded-md border-l border-r border-t">
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  {isShowReportLogger ? (
                    <h1 className="font-medium">
                      Report Logger
                    </h1>
                  ) : (
                    <h1 className="font-medium">
                      Report Formulation
                    </h1>
                  )}
                </div>
              </div>

              <div className="h-[210px] overflow-x-auto">
                <Table>
                  <TableCaption>
                    {data?.FormulationReportLines?.length ==
                    0
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
                      <TableHead className="text-center">
                        Tolerance Grouping
                      </TableHead>
                      <TableHead className="text-right">
                        Max
                      </TableHead>
                      <TableHead className="text-right">
                        Min
                      </TableHead>
                      <TableHead className="text-right">
                        Target Mass
                      </TableHead>
                      <TableHead className="text-right">
                        Logger
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.FormulationReportLines?.map(
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
                          <TableCell className="text-center">
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
                          <TableCell className="text-right">
                            {item.max}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.min}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.targetMass}
                          </TableCell>
                          <TableCell className="text-right">
                            <DialogReportLogger
                              reportLoggers={
                                // @ts-ignore
                                item.FormulationReportWeighingLoggers
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </AlertDialogHeader>
        <div className="flex w-full items-end justify-end">
          <div className="flex gap-2">
            <AlertDialogCancel
              className="w-[100px] border-blue-500 text-blue-400 hover:bg-blue-300 hover:text-blue-500"
              onClick={() => back()}
            >
              Close
            </AlertDialogCancel>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
