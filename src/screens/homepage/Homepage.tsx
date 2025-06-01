import FormDialogScanFormula from '~/components/FormDialogScanFormula';
import FormDialogScanFormulaManual from '~/components/FormDialogScanFormulaManual';
import ContainerLayout from '~/components/ContainerLayout';
import MaterialLists from './MaterialLists';

import { useEffect, useMemo, useState } from 'react';
import { nightSleep } from '~/lib/helpers';
import { FilterFormulation } from './FilterFormulation';
import { Store } from 'tauri-plugin-store-api';
import {
  connectToGuardWebSocket,
  connectToScaleWebSocket,
} from '~/actions/websocket.action';
import { DetailFormulationByMaterialList } from './DetailFormulationByMaterialList';
import { NoScanFormulation } from './NoScanFormulation';
import { DialogApprovalProblem } from './DialogApprovalProblem';
import { DialogRequestSupervisorApproval } from './DialogRequestSupervisorApproval';

import {
  useLocation,
  useSearchParams,
} from 'react-router-dom';

import {
  useFormulationReport,
  useUserAuthStore,
  useUserDisplayStore,
} from '~/lib/store/store';
import { Card } from '~/components/ui/card';
import { Box, Image, RefreshCw } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import {
  getReportFormulationLines,
  updateReportFormulationLines,
} from '~/actions/reports.action';
import {
  FormulationReportLine,
  RawMaterialStock,
  ScaleDevice,
  WeighingLoggerRequest,
} from '~/lib/types/types';
import Spinner, {
  SmallSpinner,
} from '~/components/Spinner';

import onScan from 'onscan.js';
import { getRawMaterialStockWithQRCode } from '~/actions/raw-material-stock.action';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';

export default function Homepage() {
  const store = new Store('.settings.dat');
  const location = useLocation();
  const [isEnablePrinting, setIsEnablePrinting] = useState(false) // prettier-ignore
  const [isEnableManualWorkOrder, setIsEnableManualWorkOrder] = useState(false) // prettier-ignore
  const [searchParams, setSearch] = useSearchParams();
  const [isStableSign, setIsStableSign] = useState(false);
  const [scaleValue, setScaleValue] = useState<number>(0);
  const [scaleUnit, setScaleUnit] = useState('');
  const [scaleName, setScaleName] = useState('Scale');
  const [storageURL, setStoreURL] = useState<string>('');
  const [device, setDevice] = useState<ScaleDevice>();
  const [frLine, setFrLine] =
    useState<FormulationReportLine>();
  const [isWaitWeight, setIsWeitingWeight] =
    useState<boolean>(false);
  const [rawMaterialStock, setRawMaterialStock] =
    useState<RawMaterialStock>();

  const { user } = useUserAuthStore((state) => state);
  const { isExpandedSidebar, setGuardedMaterial, guardedMaterial, setIsScaleConnected, setScaleFractionalDigit } = useUserDisplayStore((state) => state); // prettier-ignore
  const { isUserScannedMaterialReports } = useUserAuthStore(); // prettier-ignore

  const {
    formulationReportsLines,
    setSelectedFormulationReportLines,
    setAppFractionalDigit,
  } = useFormulationReport((state) => state);

  const isOpenFormDialogFormula = searchParams.get('is_modal'); // prettier-ignore
  const isOpenApprovalProblem = searchParams.get('is_has_approval_problem') // prettier-ignore
  const isNeedSupervisorApprove = searchParams.get('is_need_supervisor_approval') // prettier-ignore

  const formulationReportLinesDone = Array.isArray(formulationReportsLines) ? formulationReportsLines?.filter((item: any) => item.status == 1) : [] // prettier-ignore
  const formulationReportLinesEmpty = Array.isArray(formulationReportsLines) ? formulationReportsLines?.filter((item: any) => item.actualMass == 0 && item.status == 0) : [] // prettier-ignore
  const formulationReportLinesPartial = Array.isArray(formulationReportsLines) ? formulationReportsLines?.filter((item: any) => item.actualMass > 0 && item.status == 0) : [] // prettier-ignore

  const scaleIndicator = useMemo(() => {
    let disabledSubmit = isWaitWeight;
    let valueSubmit: WeighingLoggerRequest = {
      formulationReportLinesId: null,
      mass: null,
      productBatchNumber: null,
      operator: null,
      notes: null,
      appId: null,
      supplier: null,
      manufacturer: null,
    };
    let error: {
      scale: string | null;
    } = {
      scale: null,
    };

    const targetMass =
      (frLine?.targetMass ?? 0) > 0
        ? frLine?.targetMass.toFixed(4)
        : 0;
    const max = frLine?.max ?? 0;
    const min = frLine?.min ?? 0;
    const total = max * 0.2 + max;

    const currentProgress = Math.round(
      (scaleValue / total) * 100,
    );
    const minFlag = Math.round((min / total) * 100);
    const maxFlag = Math.round((max / total) * 100);

    if (scaleValue < min) {
      disabledSubmit = true;
      error.scale =
        'The scale value is less than the minimum value specified';
    }

    if (!rawMaterialStock) {
      disabledSubmit = true;
      error.scale =
        'Please scan the stock material QR code';
    } else if (rawMaterialStock.stock < scaleValue) {
      disabledSubmit = true;
      error.scale =
        'Unable to weigh because the stock material value is insufficient';
    }

    if (rawMaterialStock && frLine) {
      valueSubmit = {
        formulationReportLinesId: frLine.id,
        appId: `${device?.ID}`,
        manufacturer: rawMaterialStock.manufacturer,
        supplier: rawMaterialStock.supplier,
        operator: user.username as string,
        mass: scaleValue,
        notes: `Weight date ${new Date().toString()}`,
        productBatchNumber: `${frLine.FormulationReportHeader.batchProductionId}`,
      };
    }

    return {
      error,
      valueSubmit,
      disabledSubmit,
      targetMass,
      max,
      min,
      total,
      currentProgress,
      minFlag,
      maxFlag,
    };
  }, [scaleValue, frLine, isWaitWeight, rawMaterialStock]);

  const handleDetectDevice = async () => {
    const device = (await store.get(
      'tauri_formulation_scale_device',
    )) as { value: Array<ScaleDevice> };

    const devices = Object.values(device.value);
    if (devices.length > 0) {
      setDevice(devices[0]);
    }
  };

  const handleDetectStoreURL = async () => {
    const storageURL = (await store.get(
      'tauri_formulation_store_url',
    )) as { value: string };
    setStoreURL(storageURL.value);
  };

  const handleDetectEnablePrinting = async () => {
    const isEnabled = (await store.get(
      'tauri_formulation_enable_printing',
    )) as { value: boolean };
    setIsEnablePrinting(isEnabled.value);
  };

  const handleDetectEnableManualWorkOrder = async () => {
    const isEnabled = (await store.get(
      'tauri_implement_manual_work_order',
    )) as { value: boolean };
    setIsEnableManualWorkOrder(isEnabled.value);
  };

  const handleGetFractionalDigits = async () => {
    const fractionalDigit = (await store.get(
      'tauri_fractional_digit',
    )) as { value: number };
    setAppFractionalDigit(fractionalDigit.value);
  };

  const handleDetectConnectToScale = async () => {
    await nightSleep(1000);
    if (scaleUnit == '' && scaleValue == 0) {
      setIsScaleConnected(false);
    } else {
      setIsScaleConnected(true);
    }
  };

  const scaleConnect = async (isButtonPressed = false) => {
    connectToScaleWebSocket(
      setScaleValue,
      setIsStableSign,
      setScaleUnit,
      setScaleName,
      setScaleFractionalDigit,
      isButtonPressed,
    );
  };

  const handleListenToScanner = (barcode: string) => {
    setRawMaterialStock(undefined);
    getRawMaterialStockWithQRCode(barcode).then((data) => {
      setRawMaterialStock(data);
    });
  };

  const handleGetFormulationReportLine = () => {
    setFrLine(undefined);
    setIsWeitingWeight(true);
    getReportFormulationLines().then((data) => {
      if ((data?.count ?? 0) > 0 && data?.rows) {
        const row = data?.rows[0];
        setFrLine(row);
        setIsWeitingWeight(false);
      }
    });
  };

  const handleSubmit = () => {
    if (frLine?.id)
      updateReportFormulationLines(
        frLine?.id,
        scaleIndicator.valueSubmit,
      )
        .then(() => {
          setScaleValue(0);
          setRawMaterialStock(undefined);
          setFrLine(undefined);
          setIsWeitingWeight(true);
          toast.success(`Weighing was successful`);
          // handleGetFormulationReportLine();
        })
        .catch((err) => {
          toast.error(err.message);
        });
  };

  const handleRefresh = () => {
    scaleConnect();
    connectToGuardWebSocket(setGuardedMaterial, user);
    handleGetFormulationReportLine();
    handleDetectDevice();
    handleDetectStoreURL();
    handleDetectEnablePrinting();
    handleGetFractionalDigits();
    handleDetectEnableManualWorkOrder();
  };

  useEffect(() => {
    const options = {
      onScan: handleListenToScanner,
      keyCodeMapper: function (e: any) {
        const allowedRegex = /^[a-zA-Z0-9\/ &().=?-]$/;
        const char = e.key;
        return allowedRegex.test(char) ? char : '';
      },
      reactToPaste: true,
      minLength: 4,
    };

    onScan.attachTo(document, options);

    return () => {
      onScan.detachFrom(document); // pastikan detach saat unmount
    };
  }, []);

  useEffect(() => {
    if (guardedMaterial?.server) {
      if (
        guardedMaterial?.server?.indexOf(
          'RELOAD_FETCH_FORMULATION_REPORT_LINE',
        ) != -1
      ) {
        const partialMessage =
          guardedMaterial?.server?.split('|');
        if (partialMessage.length == 3) {
          handleGetFormulationReportLine();

          // const [, formulationName, batchProductionCode] =
          //   partialMessage;
          // if (
          //   formulationName ==
          //     frLine?.FormulationReportHeader
          //       .formulationName &&
          //   batchProductionCode ==
          //     frLine.FormulationReportHeader.BatchProduction
          //       .code
          // ) {
          //  TODO :
          // }
        }
      }
    }
  }, [guardedMaterial]);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    handleDetectConnectToScale();
  }, [scaleValue, scaleUnit, location.pathname]);

  return (
    <>
      <ContainerLayout className="flex h-full w-full flex-col justify-start overflow-y-auto pr-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row justify-start gap-2">
            <div className="flex rounded-xl border p-5 font-bold shadow-sm">
              {!isWaitWeight ? (
                frLine?.FormulationReportHeader
                  .formulationName
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <SmallSpinner />
                  Waiting formulation...
                </div>
              )}
            </div>
            <div className="flex rounded-xl border p-5 font-bold shadow-sm">
              {!isWaitWeight ? (
                frLine?.FormulationReportHeader
                  .BatchProduction.code
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <SmallSpinner />
                  Waiting weighing order...
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleRefresh}
            variant="ghost"
            className="rounded-full"
          >
            <RefreshCw size={15} />
          </Button>
        </div>
        <div className="mt-10 flex flex-col gap-2">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row items-center gap-2">
              <span className="rounded-lg bg-gray-100 p-2">
                <Box className="text-green-400" />
              </span>
              <p>
                {!isWaitWeight ? (
                  frLine?.materialName
                ) : (
                  <div className="flex flex-row items-center gap-2">
                    <SmallSpinner />
                    Waiting material...
                  </div>
                )}
              </p>
            </div>
            <div className="flex flex-row items-end justify-end">
              <p>
                <span className="text-gray-500">
                  {!isWaitWeight ? scaleValue : 0}
                </span>
                /
                <span>
                  {!isWaitWeight
                    ? scaleIndicator.targetMass
                    : 0}
                </span>{' '}
                gr
              </p>
            </div>
          </div>

          <div className="flex-1 gap-2">
            <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                style={{
                  left: `${!isWaitWeight ? scaleIndicator.minFlag : 80}%`,
                }}
                className={`absolute top-0 h-full w-[1px] bg-green-500`}
              ></div>
              <div
                style={{
                  left: `${!isWaitWeight ? scaleIndicator.maxFlag : 90}%`,
                }}
                className={`absolute h-full w-[1px] bg-red-500`}
              ></div>
              <div
                style={{
                  width:
                    scaleIndicator.currentProgress + '%',
                }}
                className={`h-full bg-green-600`}
              ></div>
            </div>
            <div className="relative mt-1 flex justify-between text-[10px] text-gray-400">
              <span
                style={{
                  left: `${!isWaitWeight ? scaleIndicator.minFlag : 80}%`,
                }}
                className={`absolute text-green-500`}
              >
                MIN
              </span>
              <span
                style={{
                  left: `${!isWaitWeight ? scaleIndicator.maxFlag : 90}%`,
                }}
                className={`absolute text-red-500`}
              >
                MAX
              </span>
            </div>
          </div>

          <p
            className={cn({
              'text-red-500': scaleIndicator.error.scale,
            })}
          >
            {scaleIndicator.error.scale}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 items-center gap-5">
          <div className="grid grid-cols-2 gap-2">
            {rawMaterialStock?.raw_material
              .photo_material_package &&
            rawMaterialStock?.raw_material
              .photo_material_visual ? (
              <>
                <img
                  className="rounded-xl border border-dashed"
                  src={`${storageURL}/${
                    rawMaterialStock?.raw_material
                      .photo_material_package
                  }`}
                />
                <img
                  className="rounded-xl border border-dashed"
                  src={`${storageURL}/${
                    rawMaterialStock?.raw_material
                      .photo_material_package
                  }`}
                />
              </>
            ) : (
              <>
                <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed text-gray-400">
                  <Image size={40} />
                  <span className="font-[300]">
                    Material Package Image
                  </span>
                </div>
                <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed text-gray-400">
                  <Image size={40} />
                  <span className="font-[300]">
                    Material Visual Image
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-col rounded-lg border p-1">
              <span className="text-xs text-gray-500">
                Jenis
              </span>
              <p className="font-bold">
                {rawMaterialStock?.rm_name}
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-1">
              <span className="text-xs text-gray-500">
                Material Name
              </span>
              <p className="font-bold">
                {
                  rawMaterialStock?.raw_material
                    .material_name
                }
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-1">
              <span className="text-xs text-gray-500">
                Lot Number
              </span>
              <p className="font-bold">
                {rawMaterialStock?.lot_number}
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-1">
              <span className="text-xs text-gray-500">
                Supplier
              </span>
              <p className="font-bold">
                {rawMaterialStock?.supplier}
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-1">
              <span className="text-xs text-gray-500">
                Manufacturer
              </span>
              <p className="font-bold">
                {rawMaterialStock?.manufacturer}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-row items-center justify-between gap-5">
          <div className="grid grid-cols-3 gap-1">
            <Button className="rounded-full bg-green-400 hover:bg-green-300">
              Z
            </Button>
            <Button className="rounded-full bg-yellow-400 hover:bg-yellow-300">
              T
            </Button>
            <Button className="rounded-full bg-red-400 hover:bg-red-300">
              C
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-row items-center gap-2">
              {isWaitWeight ? (
                <>
                  <div className="h-8 w-8 rounded-full bg-yellow-300"></div>
                  <p>Waiting to Weight</p>
                </>
              ) : (
                <>
                  <div className="h-8 w-8 rounded-full bg-green-300"></div>
                  <p>Ready to Weight</p>
                </>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={scaleIndicator.disabledSubmit}
              className="bg-blue-500 hover:bg-blue-400"
            >
              Save
            </Button>
          </div>
        </div>
        {/* {isExpandedSidebar && (
          <div className="hidden w-2/4 flex-col border-r pr-2 sm:flex">
            <FilterFormulation
              allMaterialsCount={
                formulationReportsLines.length
              }
              doneMaterialsCount={
                formulationReportLinesDone.length
              }
              emptyMaterialsCount={
                formulationReportLinesEmpty.length
              }
              partialMaterislCount={
                formulationReportLinesPartial.length
              }
            />
            <MaterialLists />
          </div>
        )}

        {isUserScannedMaterialReports ? (
          <DetailFormulationByMaterialList
            scaleName={scaleName}
            scaleUnit={scaleUnit}
            scaleValue={scaleValue}
            isStableSign={isStableSign}
            isEnablePrinting={isEnablePrinting}
            scaleConnect={scaleConnect}
          />
        ) : (
          <NoScanFormulation 
            scaleName={scaleName}
            scaleConnect={scaleConnect}
          />
        )} */}
      </ContainerLayout>

      {/* {isOpenFormDialogFormula === 'true' &&
        (isEnableManualWorkOrder ? (
          <FormDialogScanFormulaManual />
        ) : (
          <FormDialogScanFormula />
        ))}

      {isOpenApprovalProblem == 'true' && (
        <DialogApprovalProblem />
      )}

      {isNeedSupervisorApprove == 'true' && (
        <DialogRequestSupervisorApproval />
      )} */}
    </>
  );
}
