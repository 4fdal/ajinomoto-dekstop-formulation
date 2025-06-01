import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { encodeObjectToBase64 } from '~/lib/helpers';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { ToleranceGroupingLine } from '~/lib/types/responses';
import { getToleranceGroupingById } from '~/actions/masters.action';

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
    label: 'Grouping Name',
    id: 'name',
    value: 'groupingName',
  },
  {
    label: 'Default Minimum Tolerance',
    id: 'min',
    value: 'defaultMin',
  },
  {
    label: 'Tolerance Type',
    id: 'toleranceType',
    value: 'defaultToleranceType',
  },
  {
    label: 'Default Maximum Tolerance',
    id: 'max',
    value: 'defaultMax',
  },
] as const;

export function DialogDetailToleranceGrouping({
  back,
}: {
  back: () => void;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearch] = useSearchParams();
  const idDelete = searchParams.get('id_delete');
  const idDetail = searchParams.get('id_detail');

  const { data } = useQuery({
    queryKey: ['tolerance-grouping-by-id'],
    queryFn: () =>
      getToleranceGroupingById(idDetail as string),
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
            Detail Tolerance Grouping
          </AlertDialogTitle>
          <AlertDialogDescription>
            Detail of Tolerance Grouping
          </AlertDialogDescription>
          <div className="flex flex-col justify-between gap-5">
            <section className="flex w-full justify-between gap-2">
              <div className="flex w-full flex-col space-y-2">
                {fields.slice(0, 2).map((field, index) => (
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
                      value={data?.[field.value]}
                      className="border-black-300 disabled:border disabled:text-black"
                    />
                  </div>
                ))}
              </div>

              <div className="w-full flex-col space-y-2">
                {fields.slice(2).map((field, index) => (
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
                      value={data?.[field.value]}
                      className="border-black-300 disabled:border disabled:text-black"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="h-[210px] overflow-x-auto">
              <Table>
                <TableCaption>
                  {data?.ToleranceGroupingLines?.length == 0
                    ? 'You have not any formulation lines'
                    : ' A list of your recorded datas.'}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lower Range</TableHead>
                    <TableHead>Upper Range</TableHead>
                    <TableHead>Max</TableHead>
                    <TableHead>Min</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.ToleranceGroupingLines?.map(
                    (
                      item: ToleranceGroupingLine,
                      idx: number,
                    ) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {item.lowerRange}
                        </TableCell>
                        <TableCell>
                          {item.upperRange}
                        </TableCell>
                        <TableCell>{item.min}</TableCell>
                        <TableCell>{item.max}</TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </section>
          </div>
        </AlertDialogHeader>
        <div className="flex w-full items-end justify-end">
          {/* <div className="flex gap-3">
            <div className="cursor-pointer rounded-full bg-blue-200 p-2">
              <ChevronLeft className="text-blue-400" />
            </div>

            <div className="cursor-pointer rounded-full bg-blue-200 p-2">
              <ChevronRight className="text-blue-400" />
            </div>
          </div> */}

          <div className="flex gap-2">
            <AlertDialogAction
              className="w-[100px] bg-blue-500 hover:bg-blue-400"
              onClick={() => back()}
            >
              Back
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
