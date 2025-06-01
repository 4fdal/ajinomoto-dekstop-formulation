import moment from 'moment';

import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';
import { ListFilter, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { getOriginalReportFormulations } from '~/actions/reports.action';
import { useNavigate } from 'react-router-dom';

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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export function FilterReportFormulation({
  // @ts-ignore
  listFormulationNames,
  setQuerySearch,
  refetch,
  shouldDirty,
  // @ts-ignore
  querySearch,
  formattedDateRange,
}: {
  listFormulationNames: string[];
  setQuerySearch: any;
  refetch: any;
  shouldDirty: boolean;
  querySearch: any;
  formattedDateRange: any;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = moment().format('YYYY-MM-DD');

  const [valueFilter, setValueFilter] = useState({
    formulation_name: '',
    formulation_status: '',
  });

  const handleApplyFilter = () => {
    if (
      valueFilter.formulation_name !== '' ||
      valueFilter.formulation_status !== ''
    ) {
      navigate(
        `?q_filter&formulation_name=${valueFilter.formulation_name}&formulation_status=${valueFilter.formulation_status}`,
      );
    } else {
      navigate('/reports');
    }
  };

  const handleResetFilter = () => {
    setValueFilter({
      formulation_name: '',
      formulation_status: '',
    });
    setQuerySearch({
      formulation_name: null,
      formulation_status: null,
    });
    navigate('/reports');
    refetch();
  };

  const { data, refetch: refetchOriginal } = useQuery({
    queryKey: ['formulation-reports'],
    queryFn: () => getOriginalReportFormulations(),
  });

  const removedDuplicateLists = Array.from(
    new Set(
      data?.rows?.map((item: any) => item.formulationName),
    ),
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className={cn('rounded-sm p-2', {
            'bg-yellow-100 hover:bg-yellow-50': shouldDirty,
          })}
          variant="outline"
        >
          <ListFilter
            className={cn('text-black', {
              'text-yellow-600': shouldDirty,
            })}
          />
        </Button>
      </AlertDialogTrigger>
      <div
        className={cn('', {
          hidden:
            formattedDateRange.formatted_from == today ||
            formattedDateRange.formatted_from == '',
        })}
      >
        <Button
          className="rounded-sm bg-red-200 p-2 hover:bg-red-100"
          variant="outline"
          onClick={() => {
            navigate('/reports');
            refetch();
          }}
        >
          <Trash2 color="red" />
        </Button>
      </div>
      <AlertDialogContent className="min-h-[330px] sm:min-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ListFilter />
            Filter Report Formulation
          </AlertDialogTitle>
          <AlertDialogDescription>
            Filter report formulation
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3">
          <div className="">
            <Label htmlFor="name" className="text-right">
              Formulation Name
            </Label>
            <Select
              defaultValue={valueFilter.formulation_name}
              onValueChange={(val) =>
                setValueFilter((prevFilter) => ({
                  ...prevFilter,
                  formulation_name: val,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select formulation name" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    Formulation name lists
                  </SelectLabel>
                  {removedDuplicateLists?.map(
                    (item: any, idx: number) => (
                      <SelectItem
                        value={item as any}
                        key={idx}
                      >
                        {item}
                      </SelectItem>
                    ),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="">
            <Label
              htmlFor="username"
              className="text-right"
            >
              Formulation Status
            </Label>
            <Select
              defaultValue={valueFilter.formulation_status}
              onValueChange={(val) =>
                setValueFilter((prevFilter) => ({
                  ...prevFilter,
                  formulation_status: val,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select formulation status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    Formulation status lists
                  </SelectLabel>
                  <SelectItem value="0">
                    Waiting for implementation
                  </SelectItem>
                  <SelectItem value="1">
                    On progress
                  </SelectItem>
                  <SelectItem value="2">
                    Completed
                  </SelectItem>
                  <SelectItem value="3">Aborted</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="w-[90px]"
            onClick={handleResetFilter}
          >
            Clear
          </AlertDialogCancel>
          <AlertDialogAction
            className="w-[90px] bg-blue-500 hover:bg-blue-400"
            onClick={handleApplyFilter}
          >
            Filter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
