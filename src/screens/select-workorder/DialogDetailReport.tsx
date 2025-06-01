import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { checkStatusOrder, encodeObjectToBase64, getUserRole } from '~/lib/helpers';
import { DialogReportLogger } from './DialogReportLogger';
import { getReportFormulationById } from '~/actions/reports.action';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { FormulationLine, RFormulationReports } from '~/lib/types/responses';
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
  ScaleIcon,
  Scale3DIcon,
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
import { Button } from '~/components/ui/button';
import { WorkOrderSchema } from '~/lib/types/schemas';
import { toast } from 'sonner';
import { useFormulationReport, useUserAuthStore, useUserDisplayStore } from '~/lib/store/store';
import { createFormulationReportsV2 } from '~/actions/formulation.action';
import { z } from 'zod';

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
        return 'Belum dimulai';
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

  const { setIsUserScanMaterialReports, user } = useUserAuthStore(); // prettier-ignore
  const [isEnableOutweightRejection] = useState(false);
  const { setIsOpenDialogScanProduct } = useUserDisplayStore() // prettier-ignore

  const {
    setFormulationCode: setFormulationCodeStore,
    setFormulationName: setFormulationNameStore,

    setIsDoneAllRawMaterials,
    setFormulationReports,
    setSelectedFormulationReportLines,
    setFormulationMass,
    setMustFollowOrder,
    setNeedApproval,
    setRequestedMass,
    setTempFormulationCode,
  } = useFormulationReport();

  const {
    mutate: createFormulationReports,
    isPending: isLoadingSubmitWO,
  } = useMutation({
    mutationFn: (
      data: z.infer<typeof WorkOrderSchema>,
    ): any => {
      return createFormulationReportsV2(data);
    },
    onSuccess: (res: RFormulationReports): void => {
      setNeedApproval(res.needApproval);
      const getOriginalIndexFormulationReportLines = res.FormulationReportLines.findIndex(item => item.approvalStatus == 0 && item.status == 0) // prettier-ignore
      const isDoneAll = getOriginalIndexFormulationReportLines < 0 // prettier-ignore
      const hasUnDoneLists =
        res.FormulationReportLines.filter(
          (item: any) => item.status == 0,
        );

      /**
       * check if status order is waiting for implementation/on progress and need approval is true
       * then show uncompromised pop up (force user to logout)
       */

      const isApprovalHasAProblem = res.FormulationReportLines.some((item) => item.needApproval); // prettier-ignore
      const statusOrder = checkStatusOrder(res.status);

      if (
        ((isEnableOutweightRejection && isApprovalHasAProblem) &&
          statusOrder == 'waiting_implementation' &&
          getUserRole() !== 'Admin') ||
        ((isEnableOutweightRejection && isApprovalHasAProblem) &&
          statusOrder == 'on_progress' &&
          getUserRole() !== 'Admin')
      ) {
        navigate('?is_has_approval_problem=true');
      } else {
        setIsUserScanMaterialReports(true);
        setFormulationReports(res.FormulationReportLines);
        // setFormulationCodeStore(res.formulationCode);
        setFormulationCodeStore(
          data.orderNumber,
        );
        setTempFormulationCode(res.formulationCode);
        setFormulationNameStore(res.formulationName);
        setFormulationMass(res.formulationMass);
        setRequestedMass(res.requestedMass);

        if (res?.mustFollowOrder && getUserRole() !== 'Admin' && !isDoneAll) {
          setMustFollowOrder(res?.mustFollowOrder);
          setIsOpenDialogScanProduct(true);
          navigate(
            `?item=${getOriginalIndexFormulationReportLines}&filter_materials=all`,
          );
          setSelectedFormulationReportLines(
            res.FormulationReportLines[
              getOriginalIndexFormulationReportLines
            ],
          );
        } else if (hasUnDoneLists.length === 0) {
          setMustFollowOrder(res?.mustFollowOrder);
          setIsDoneAllRawMaterials(true);
          setSelectedFormulationReportLines({});
          navigate('/?filter_materials=done');
        } else {
          if (getUserRole() !== 'Admin') {
            setMustFollowOrder(res?.mustFollowOrder);
          }
          navigate('/');
        }
      }

      toast.success('Work order successfully created!');
    },
    onError: (err) => {
      console.log(err);
      toast.error('Failed to create work order!');
    },
  });

  async function onTimbang() {
    createFormulationReports({
      formulation_code: data.formulationCode,
      formulation_name: data.formulationName,
      order_qty: `${data.requestedMass}`,
      work_order: data.orderNumber,
      multiplier: ""
    });
  }


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
                      {/* <TableHead className="text-right">
                        Max
                      </TableHead> */}
                      {/* <TableHead className="text-right">
                        Min
                      </TableHead> */}
                      <TableHead className="text-right">
                        Actual/Target
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
                            {item.productCode}
                          </TableCell>
                          <TableCell>
                            {item.productName}
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
                          {/* <TableCell className="text-right">
                            {item.max}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.min}
                          </TableCell> */}
                          <TableCell className="text-right">
                          {`${item?.actualMass?.toFixed(3)}/${item?.targetMass?.toFixed(3)} ${item.unit}`}
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
        <div className="flex w-full items-end justify-end gap-5">
          <div className="flex gap-2">
            <AlertDialogCancel
              className="w-[100px] border-blue-500 text-blue-400 hover:bg-blue-300 hover:text-blue-500"
              onClick={() => back()}
            >
              Close
            </AlertDialogCancel>
          </div>
          <Button
            className={cn(
              'flex items-center gap-4 w-[200px] bg-blue-500 hover:bg-blue-400',
              { 'bg-gray-400 cursor-not-allowed': data?.status !== 0 && data?.status !== 1 } 
            )}
            onClick={() => onTimbang()}
            disabled={data?.status !== 0 && data?.status !== 1}
          >
            <ScaleIcon />
            {data?.status === 0 || data?.status === 1 ? 'Timbang' : 'Sudah Selesai'} 
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
