import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { DialogApproveFormulationReportLines } from './DialogApproveFormulationReportLines';
import { DialogRejectFormulationReportLines } from './DialogRejectFormulationReportLines';
import { ProgressScaleV3 } from '~/components/ui/progress-scale-v3';
import { cn } from '~/lib/utils';
import { Store } from 'tauri-plugin-store-api';
import { useEffect, useRef, useState } from 'react';
import { parseDataPrint } from '~/lib/formatter';
import { DialogScanProductCode } from './DialogScanProductCode';
import { DialogAlertDoneMaterials } from './DialogAlertDoneMaterials';
import DialogScanProductCodeManual from './DialogScanProductCodeManual';

import {
  useFormulationReport,
  useUserAuthStore,
  useUserDisplayStore,
} from '~/lib/store/store';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  getUserRole,
  handleLogoutAndUnsubscribeStates,
} from '~/lib/helpers';

import {
  patchFormulationReportsById,
  printAfterWeighing,
} from '~/actions/formulation.action';

import {
  Box,
  ClipboardMinus,
  Scale,
  Save,
  TriangleAlert,
  Play,
  CheckCheck,
  Printer,
  NotebookPenIcon,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { VirtualKeyboard } from '~/components/VirtualKeyboard';
import { sendCommand } from '~/actions/websocket.action';

export const DetailFormulationByMaterialList = ({
  scaleValue,
  isEnablePrinting,
  isStableSign,
  scaleUnit,
  scaleName,
  scaleConnect,
}: {
  scaleValue: number | null;
  isEnablePrinting: boolean;
  isStableSign: boolean;
  scaleUnit: string;
  scaleName: string;
  scaleConnect: (isButtonPressed: boolean) => void;
}) => {
  // const isStableSign = true;
  const navigate = useNavigate();
  const store = new Store('.settings.dat');

  const [searchParams, setSearch] = useSearchParams();
  // const [isOpenModalEqualScoreScale, setIsOpenModalEqualScoreScale] = useState<boolean>(false); // prettier-ignore
  const [isOpenModalHasMoreScoreScale, setIsOpenModalHasMoreScoreScale] = useState<boolean>(false); // prettier-ignore
  const [isOpenModalReprint, setIsOpenModalReprint] = useState<boolean>(false); // prettier-ignore
  const [isOpenModalInstruction, setIsOpenModalInstruction] = useState<boolean>(false); // prettier-ignore
  const [isOpenModalNotes, setIsOpenModalNotes] = useState<boolean>(false); // prettier-ignore
  const [isOpenModalBatch, setIsOpenModalBatch] = useState<boolean>(false); // prettier-ignore
  const [settingsAutoSave, setSettingsAutoSave] = useState({
    isAutoSaveWhenInTolerance: false,
    autoSaveWhenInToleranceDuration: 0,

    isAutoSaveWhenOutOfTolerance: false,
    autoSaveWhenOutOfToleranceDuration: 0,
  });
  const [lastPrintData, setLastPrintData] =
    useState<string>('');
  const [isEnableManualWorkOrder, setIsEnableManualWorkOrder] = useState(false) // prettier-ignore
  const {
    scaleFractionalDigit,
    isOpenDialogScanProduct,
    setIsOpenDialogScanProduct,
  } = useUserDisplayStore();
  const { user, setIsUserScanMaterialReports } = useUserAuthStore(); // prettier-ignore
  const [notes, setNotes] = useState<string>('');
  const [
    isEnableOutweightRejection,
    setIsEnableOutweightRejection,
  ] = useState(false);
  const [
    isEnableOverweightProtection,
    setIsEnableOverweightProtection,
  ] = useState(false);

  const [
    isEnableScanProductCode,
    setIsEnableScanProductCode,
  ] = useState<boolean>(false);

  const {
    selectedFormulationReportLines,
    formulationCode,
    formulationName,
    formulationMass,
    productBatchNumber,
    mustFollowOrder,
    scanProductCode,
    isReadyToStartWeighing,
    isDoneAllRawMaterials,
    requestedMass,
    appFractionalDigit,

    setFormulationReports,
    setScanProductCode,
    setSelectedFormulationReportLines,
    setIsReadyToStartWeighing,
    setIsDoneAllRawMaterials,
    setProductBatchNumber,
  } = useFormulationReport();

  const currentMaterialCard = searchParams.get('item');
  const currentScaleScore: number = selectedFormulationReportLines?.actualMass + scaleValue; // prettier-ignore
  const isHasMoreThanMaximum: boolean = parseFloat(currentScaleScore.toFixed(appFractionalDigit)) > parseFloat(selectedFormulationReportLines?.max?.toFixed(appFractionalDigit)) && (selectedFormulationReportLines?.max !== 0); // prettier-ignore
  const remainingScoreScale: number = selectedFormulationReportLines?.targetMass - currentScaleScore // prettier-ignore
  const isLessThanZero: boolean = currentScaleScore < 0;
  const isScoreScaleStable: boolean = currentScaleScore === selectedFormulationReportLines?.min && (currentScaleScore !== 0) // prettier-ignore
  const isScoreBetweenMinMax: boolean = currentScaleScore >= parseFloat(selectedFormulationReportLines?.min?.toFixed(appFractionalDigit)) && (currentScaleScore !== 0) // prettier-ignore
  const isLoggedInAsAdmin: boolean = getUserRole() == 'Admin'; // prettier-ignore
  const isConditionOne: boolean = scanProductCode == '' && !!currentMaterialCard && !isOpenModalHasMoreScoreScale && !isLoggedInAsAdmin; // prettier-ignore
  const isNotReadyToStartWeighingAndScannedProductCode = !isReadyToStartWeighing && scanProductCode !== '' // prettier-ignore

  const { mutate, isPending } = useMutation({
    mutationFn: (currentScore: number) => {
      console.log(currentScore);
      return patchFormulationReportsById({
        // @ts-ignore
        mass: parseFloat(scaleValue),
        productBatchNumber,
        id: selectedFormulationReportLines.id,
        unit: selectedFormulationReportLines.unit,
        judgement: parseInt(
          selectedFormulationReportLines.judgement,
        ),
        appId: currentAppId,
        notes,
        isDisableRejection: !isEnableOutweightRejection,
      });
    },
    onSuccess: async (_) => {
      toast.success('Success update formulation!');
      if (
        isEnableOutweightRejection &&
        isHasMoreThanMaximum
      ) {
        // setIsOpenDialogScanProduct(false)
        // setIsOpenModalEqualScoreScale(false);
        return setIsOpenModalHasMoreScoreScale(true);
      }
      const hasDoneLists = _.FormulationReportLines.filter(
        (item: any) => item.status == 0,
      );

      setIsReadyToStartWeighing(false);
      // setIsOpenModalEqualScoreScale(false);
      setProductBatchNumber(''); // reset batch number to ''
      setFormulationReports(_.FormulationReportLines);

      let targetIdx = 0;
      let targetSeequence = Infinity;

      _.FormulationReportLines.forEach(
        (element: any, idx: number) => {
          console.log(
            element.status,
            element.status == 0,
            targetSeequence > element.sequence,
            targetSeequence,
            '>',
            element.sequence,
            element.approvalStatus,
            element.approvalStatus == 0,
          );
          if (
            element.status == 0 &&
            targetSeequence > element.sequence &&
            element.approvalStatus == 0
          ) {
            targetSeequence = element.sequence;
            targetIdx = idx;
          }
        },
      );

      console.log(_.FormulationReportLines, targetIdx);

      setSelectedFormulationReportLines(
        _.FormulationReportLines[targetIdx],
      );
      if (mustFollowOrder && hasDoneLists.length !== 0) {
        setScanProductCode('');
        setTimeout(() => {
          navigate(`?item=${targetIdx}`);
        }, 500);
      } else if (hasDoneLists.length === 0) {
        setIsDoneAllRawMaterials(true);
        setSelectedFormulationReportLines({});
        navigate('/?filter_materials=done');
      } else {
        setSelectedFormulationReportLines({});
        navigate('/?filter_materials=all');
      }

      if (isEnablePrinting) {
        const body = await parseDataPrint(
          _,
          selectedFormulationReportLines.id,
          user,
        );
        setLastPrintData(body);
        printAfterWeighing({ body });
      }
    },
  });

  const rePrint = async () => {
    if (lastPrintData == '') {
      toast.warning(
        'No data to print. Please weigh first!',
      );
      return;
    }
    printAfterWeighing({
      body: lastPrintData, // prettier-ignore
    });
    setIsOpenModalReprint(false);
  };

  const getAutoSaveSettings = async () => {
    const isImplementAutoSettingInTolerance =
      (await store.get(
        'tauri_implement_auto_save_time_weight_in_tolerance',
      )) as { value: string };

    const autoSaveTimeWeightInToleranceDuration =
      (await store.get(
        'tauri_auto_save_time_weight_in_tolerance',
      )) as { value: number };

    const isImplementAutoSettingOutOfTolerance =
      (await store.get(
        'tauri_implement_auto_save_time_weight_out_of_tolerance',
      )) as { value: string };

    const enableScanProductCode = (await store.get(
      'tauri_enable_scan_product_code',
    )) as { value: boolean };
    setIsEnableScanProductCode(enableScanProductCode.value);

    const autoSaveTimeWeightOutOfToleranceDuration =
      (await store.get(
        'tauri_auto_save_time_weight_out_of_tolerance',
      )) as { value: number };

    setSettingsAutoSave(() => ({
      isAutoSaveWhenInTolerance:
        isImplementAutoSettingInTolerance.value == 'yes',
      autoSaveWhenInToleranceDuration:
        autoSaveTimeWeightInToleranceDuration.value,
      isAutoSaveWhenOutOfTolerance:
        isImplementAutoSettingOutOfTolerance.value == 'yes',
      autoSaveWhenOutOfToleranceDuration:
        autoSaveTimeWeightOutOfToleranceDuration.value,
    }));
  };

  const handleDetectEnableManualWorkOrder = async () => {
    const isEnabled = (await store.get(
      'tauri_implement_manual_work_order',
    )) as { value: boolean };
    setIsEnableManualWorkOrder(isEnabled.value);
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (
      isStableSign &&
      currentScaleScore >=
        selectedFormulationReportLines.min &&
      getUserRole() !== 'Admin' &&
      scanProductCode !== '' &&
      !isHasMoreThanMaximum &&
      selectedFormulationReportLines.status !== 1 &&
      isReadyToStartWeighing &&
      settingsAutoSave.isAutoSaveWhenInTolerance
    ) {
      timeoutId = setTimeout(() => {
        mutate(currentScaleScore);
      }, settingsAutoSave.autoSaveWhenInToleranceDuration);
    }

    if (
      isHasMoreThanMaximum &&
      getUserRole() !== 'Admin' &&
      scanProductCode !== '' &&
      selectedFormulationReportLines.status !== 1 &&
      isReadyToStartWeighing &&
      settingsAutoSave.isAutoSaveWhenOutOfTolerance
    ) {
      timeoutId = setTimeout(() => {
        mutate(currentScaleScore);
      }, settingsAutoSave.autoSaveWhenOutOfToleranceDuration);
    }

    return () => clearTimeout(timeoutId);
  }, [
    scanProductCode,
    isScoreScaleStable,
    currentScaleScore,
    isStableSign,
    currentMaterialCard,
    isReadyToStartWeighing,
  ]);

  const [currentAppId, setCurrentAppId] = useState('');
  const getAppId = async () => {
    const appId = (await store.get(
      'tauri_application_id',
    )) as { value: string };

    useUserDisplayStore.setState({
      currentAppId: appId.value,
    });
    setCurrentAppId(appId.value);
  };

  useEffect(() => {
    getAutoSaveSettings();
    getAppId();
    const handleGetIsEnableOutweightRejection =
      async () => {
        const isEnableOutweightRejection = await store.get<{value: boolean}>('tauri_enable_outweight_rejection') // prettier-ignore
        setIsEnableOutweightRejection(
          isEnableOutweightRejection!.value,
        );
      };

    const handleGetIsEnableOverWeightProtection =
      async () => {
        const isEnableOverweightProtection = await store.get<{value: boolean}>('tauri_enable_overweight_protection') // prettier-ignore
        setIsEnableOverweightProtection(
          isEnableOverweightProtection!.value,
        );
      };

    handleGetIsEnableOverWeightProtection();
    handleGetIsEnableOutweightRejection();
    return () => {
      setIsReadyToStartWeighing(false);
      if (!mustFollowOrder) {
        setSelectedFormulationReportLines({});
      }
      handleDetectEnableManualWorkOrder();
    }; // reset ready start weighing to false when navigating to another page
  }, []);

  const {
    isShowVirtualKeyboard,
    setIsShowVirtualKeyboard,
    isScaleInternal,
  } = useUserDisplayStore();
  const [focusedField, setFocusedField] = useState<'notes' | 'batch'>(); // prettier-ignore
  const [isEnableVirtual, setIsEnableVirtual] = useState(false); // prettier-ignore
  const [tempField, setTempField] = useState('');

  const keyboard = useRef();
  const caretPositionRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>();
  const inputRef2 = useRef<HTMLInputElement>();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  }, [tempField]);

  const updateCaretPosition = (newInput: any) => {
    const newPosition = caretPositionRef.current + (newInput.length - tempField.length); // prettier-ignore
    caretPositionRef.current = newPosition < 0 ? 0 : newPosition; // prettier-ignore
  };

  const handleCurrentFocusField = (
    field: 'notes' | 'batch',
  ): void => {
    let initialVal = notes;
    switch (field) {
      case 'notes':
        initialVal = notes;
        break;
      case 'batch':
        initialVal = productBatchNumber;
        break;
    }
    // @ts-expect-error
    keyboard?.current.setInput(initialVal);
    if (initialVal == '') {
      setTempField('');
      caretPositionRef.current = 1;
    }
    setFocusedField(field);
    setIsShowVirtualKeyboard(true);
    // clearPreviousInput();
  };

  const onChange = (newInput: string) => {
    updateCaretPosition(newInput);
    setTempField(tempField);

    switch (focusedField) {
      case 'notes':
        setNotes(newInput);
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      case 'batch':
        setProductBatchNumber(newInput);
        if (inputRef2.current) {
          inputRef2.current.focus();
          inputRef2.current.setSelectionRange(
            caretPositionRef.current,
            caretPositionRef.current,
          );
        }
        break;

      default:
        break;
    }
  };

  const handleVirtualKeyboardChange = (txt: string) => {
    onChange(txt);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }

    if (inputRef2.current) {
      inputRef2.current.focus();
      inputRef2.current.setSelectionRange(
        caretPositionRef.current,
        caretPositionRef.current,
      );
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col gap-4 pl-2 pr-4">
        <div className="flex items-center justify-between">
          <div className="flex">
            <div
              onClick={() => scaleConnect(true)}
              className="flex items-center gap-3"
            >
              <div className="cursor-pointer rounded-full bg-gray-800 p-2">
                <Scale size={24} color="white" />
              </div>
              <h1 className="text-[30px] font-semibold">
                {scaleName ? scaleName : 'Scale'}
              </h1>
            </div>
            {isScaleInternal ? (
              <div className="ml-10 flex flex-col">
                <div className="flex gap-5">
                  <div
                    onClick={() => {
                      sendCommand('C@', () => {
                        toast.success('Clear terkirim');
                      });
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className="cursor-pointer items-center rounded-full bg-blue-800 p-2">
                      <span className="z-50 place-content-center self-center px-2 text-white">
                        C
                      </span>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      sendCommand('T@', () => {
                        toast.success('Tare terkirim');
                      });
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className="cursor-pointer items-center rounded-full bg-blue-800 p-2">
                      <span className="z-50 place-content-center self-center px-2 text-white">
                        T
                      </span>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      sendCommand('Z@', () => {
                        toast.success('Zero terkirim');
                      });
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className="cursor-pointer items-center rounded-full bg-blue-800 p-2">
                      <span className="z-50 place-content-center self-center px-2 text-white">
                        Z
                      </span>
                    </div>
                  </div>
                </div>
                {/* Tare: 1000 */}
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="flex items-end">
            <h1 className="text-[60px] font-bold text-blue-500">
              {isLoggedInAsAdmin
                ? 0.0
                : parseFloat(scaleValue as any).toFixed(
                    scaleFractionalDigit,
                  )}
            </h1>
            <span className="text-xl font-semibold text-blue-500">
              {scaleUnit}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 sm:h-[140px] sm:flex-row">
          <div className="w-full rounded-lg bg-[#eff0fa] p-3">
            <h1 className="text-lg font-semibold">
              Work Order
            </h1>
            <h1 className="text-center text-2xl font-semibold text-blue-500">
              {formulationCode}
            </h1>
          </div>
          <div className="w-full rounded-lg bg-[#eff0fa] p-3">
            <h1 className="text-lg font-semibold">
              Formula Name
            </h1>
            <h1 className="text-center text-2xl font-semibold text-blue-500">
              {formulationName}
            </h1>
          </div>
          <div className="w-full rounded-lg bg-[#eff0fa] p-3">
            <h1 className="text-lg font-semibold">
              Order Qty
            </h1>
            <h1 className="text-center text-2xl font-semibold text-blue-500">
              {parseFloat(requestedMass as any).toFixed(
                appFractionalDigit,
              )}
            </h1>
          </div>
        </div>

        <div className="flex h-full flex-col space-y-5 rounded-md bg-[#eff0fa] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Box size={40} />
              <h1 className="text-2xl font-semibold">
                {
                  selectedFormulationReportLines?.productName
                }
              </h1>
            </div>

            <div>
              <h1 className="font-semibold italic">
                <span
                  className={cn('font-semibold', {
                    'text-red-500':
                      (isHasMoreThanMaximum &&
                        isReadyToStartWeighing) ||
                      isLessThanZero,
                  })}
                >
                  {isNaN(
                    parseFloat(
                      currentScaleScore as any,
                    ).toFixed(appFractionalDigit) as any,
                  ) || !isReadyToStartWeighing
                    ? 0.0
                    : parseFloat(
                        currentScaleScore as any,
                      ).toFixed(appFractionalDigit) || ''}
                </span>{' '}
                /{' '}
                {isNaN(
                  parseFloat(
                    selectedFormulationReportLines.targetMass as any,
                  ).toFixed(appFractionalDigit) as any,
                )
                  ? 0.0
                  : parseFloat(
                      selectedFormulationReportLines.targetMass as any,
                    ).toFixed(appFractionalDigit)}
              </h1>
            </div>
          </div>
          <div>
            <ProgressScaleV3
              minValue={parseFloat(selectedFormulationReportLines?.min?.toFixed(appFractionalDigit))}
              maxValue={parseFloat(selectedFormulationReportLines?.max?.toFixed(appFractionalDigit))}
              value={
                isLoggedInAsAdmin ? 0 : currentScaleScore
              }
              isHasMoreThanMaximum={isHasMoreThanMaximum}
              indicatorColor={
                isScoreBetweenMinMax &&
                !isHasMoreThanMaximum
                  ? 'bg-green-500'
                  : isHasMoreThanMaximum
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              }
            />
          </div>

          {isConditionOne || isOpenDialogScanProduct ? (
            <section className="flex gap-2">
              {isEnableManualWorkOrder ? (
                <DialogScanProductCodeManual />
              ) : (
                <DialogScanProductCodeManual />
                // <DialogScanProductCode />
              )}
            </section>
          ) : (isNotReadyToStartWeighingAndScannedProductCode &&
              getUserRole() !== 'Admin') ||
            isDoneAllRawMaterials ? (
            <section className="flex h-full w-full items-end justify-end pb-7">
              {isDoneAllRawMaterials &&
              getUserRole() !== 'Admin' ? (
                <>
                  <DialogAlertDoneMaterials />
                  <Button
                    onClick={() => {
                      setIsUserScanMaterialReports(false);
                      setIsDoneAllRawMaterials(false);
                      navigate('?is_modal=true');
                    }}
                    className={cn(
                      'bg-blue-500 text-white hover:bg-blue-400 hover:text-white',
                      {
                        hidden: getUserRole() == 'Admin',
                      },
                    )}
                  >
                    Execute another formulation work order
                  </Button>
                </>
              ) : (
                Object.keys(selectedFormulationReportLines)
                  .length > 0 && (
                  <Button
                    disabled={scaleValue !== 0}
                    className={cn(
                      'flex items-center gap-2 bg-blue-500 hover:bg-blue-400',
                      {
                        hidden: getUserRole() == 'Admin',
                      },
                    )}
                    onClick={() => {
                      if (
                        Object.keys(
                          selectedFormulationReportLines,
                        ).length == 0
                      ) {
                        console.log(
                          'NotReadyToSccan:',
                          isNotReadyToStartWeighingAndScannedProductCode,
                        );
                        console.log(
                          'IsDoneAllrawMats: ',
                          isDoneAllRawMaterials,
                        );
                        console.log(
                          'Overall: ',
                          (isNotReadyToStartWeighingAndScannedProductCode &&
                            getUserRole() !== 'Admin') ||
                            isDoneAllRawMaterials,
                        );
                        toast.warning(
                          'Tolong pilih material terlebih dahulu!',
                        );
                      } else {
                        if (
                          !isEnableScanProductCode &&
                          selectedFormulationReportLines.status >=
                            1
                        ) {
                          toast.error(
                            'Material sudah selesai di timbang',
                          );
                          return;
                        }
                        // const guardWebsocket =
                        //   useUserDisplayStore.getState()
                        //     .guardWebsocket;
                        // if (guardWebsocket) {
                        //   guardWebsocket.send(
                        //     `${currentAppId}:${selectedFormulationReportLines?.id}`,
                        //   );
                        //   setTimeout(() => {
                        //     const guardedMat =
                        //       useUserDisplayStore.getState()
                        //         .guardedMaterial;
                        //     if (
                        //       selectedFormulationReportLines?.id
                        //     ) {
                        //       if (
                        //         currentAppId in guardedMat
                        //       ) {
                        //         if (
                        //           guardedMat[currentAppId] ==
                        //           selectedFormulationReportLines?.id
                        //         ) {
                        setIsReadyToStartWeighing(true);
                        //         return;
                        //       }
                        //     }
                        //   }
                        //   toast.warning(
                        //     'Material sedang di timbang di tempat lain.',
                        //   );
                        // }, 100);
                        // } else {
                        //   toast.warning(
                        //     'Websocket is disconnected! No verification executed.',
                        //   );
                        //   setIsReadyToStartWeighing(true);
                        // }
                      }
                    }}
                  >
                    <Play />
                    Start Weighing
                  </Button>
                )
              )}
            </section>
          ) : (
            <section className="flex flex-col space-y-0">
              <div className="flex w-full justify-between">
                <h1 className="text-lg font-semibold">
                  Plan Qty
                </h1>
                <h1 className="text-lg font-semibold">
                  {isNaN(
                    parseFloat(
                      selectedFormulationReportLines.targetMass,
                    ),
                  )
                    ? 0.0
                    : parseFloat(
                        selectedFormulationReportLines.targetMass,
                      ).toFixed(appFractionalDigit) || 0.0}
                </h1>
              </div>
              <div className="flex w-full justify-between">
                <h1 className="text-lg font-semibold">
                  Min
                </h1>
                <h1 className="text-lg font-semibold">
                  {isNaN(
                    parseFloat(
                      selectedFormulationReportLines.min,
                    ),
                  )
                    ? 0.0
                    : parseFloat(
                        selectedFormulationReportLines.min,
                      ).toFixed(appFractionalDigit) || 0.0}
                </h1>
              </div>
              <div className="flex w-full justify-between">
                <h1 className="text-lg font-semibold">
                  Max
                </h1>
                <h1 className="text-lg font-semibold">
                  {isNaN(
                    parseFloat(
                      selectedFormulationReportLines.max,
                    ),
                  )
                    ? 0.0
                    : parseFloat(
                        selectedFormulationReportLines.max,
                      ).toFixed(appFractionalDigit) || 0.0}
                </h1>
              </div>
              <div className="flex w-full justify-between">
                <h1 className="text-lg font-semibold">
                  Remaining
                </h1>
                <h1 className="text-lg font-semibold">
                  {isNaN(
                    parseFloat(remainingScoreScale as any),
                  )
                    ? 0.0
                    : parseFloat(
                        remainingScoreScale as any,
                      ).toFixed(appFractionalDigit)}
                </h1>
              </div>
              <div className="flex w-full justify-between">
                <h1 className="text-lg font-semibold">
                  Batch No.
                </h1>
                <h1 className="text-lg font-semibold">
                  {productBatchNumber == ''
                    ? '-'
                    : productBatchNumber}
                </h1>
              </div>
              <div className="flex w-full justify-between">
                <h1 className="text-lg font-semibold">-</h1>
                <h1 className="text-lg font-semibold">-</h1>
              </div>
            </section>
          )}

          {isLoggedInAsAdmin ? (
            <div className="flex justify-end gap-2">
              <DialogRejectFormulationReportLines
                hidden={
                  !isLoggedInAsAdmin ||
                  isDoneAllRawMaterials
                }
                selectedFormulationReportLines={
                  selectedFormulationReportLines
                }
              />
              <DialogApproveFormulationReportLines
                hidden={
                  !isLoggedInAsAdmin ||
                  isDoneAllRawMaterials
                }
                selectedFormulationReportLines={
                  selectedFormulationReportLines
                }
              />
            </div>
          ) : (
            <div className="flex justify-between">
              <div className="flex gap-5">
                <Button
                  disabled={
                    selectedFormulationReportLines.status ==
                      1 &&
                    selectedFormulationReportLines.actualMass >
                      selectedFormulationReportLines.max
                  }
                  onClick={() => {
                    setIsOpenModalInstruction(true);
                  }}
                  className={cn(
                    'flex w-[120px] items-center justify-between border border-blue-700 bg-[#eff0fa] text-blue-700 hover:bg-[#eff0fa] hover:opacity-80',
                    {
                      hidden:
                        scanProductCode == '' ||
                        !isReadyToStartWeighing,
                    },
                  )}
                >
                  <NotebookPenIcon />
                  {isPending ? 'Loading..' : 'Instructions'}
                </Button>

                <Button
                  disabled={
                    selectedFormulationReportLines.status ==
                      1 &&
                    selectedFormulationReportLines.actualMass >
                      selectedFormulationReportLines.max
                  }
                  onClick={() => {
                    setIsOpenModalNotes(true);
                  }}
                  className={cn(
                    'flex w-[90px] items-center justify-between border border-blue-700 bg-[#eff0fa] text-blue-700 hover:bg-[#eff0fa] hover:opacity-80',
                    {
                      hidden:
                        scanProductCode == '' ||
                        !isReadyToStartWeighing,
                    },
                  )}
                >
                  {isPending ? 'Loading..' : '+ Notes'}
                </Button>

                <Button
                  disabled={
                    selectedFormulationReportLines.status ==
                      1 &&
                    selectedFormulationReportLines.actualMass >
                      selectedFormulationReportLines.max
                  }
                  onClick={() => {
                    setIsOpenModalBatch(true);
                  }}
                  className={cn(
                    'flex w-[110px] items-center justify-between border border-blue-700 bg-[#eff0fa] text-blue-700 hover:bg-[#eff0fa] hover:opacity-80',
                    {
                      hidden:
                        scanProductCode == '' ||
                        !isReadyToStartWeighing,
                    },
                  )}
                >
                  {isPending ? 'Loading..' : '+ Batch No.'}
                </Button>
              </div>

              <div className="flex gap-5">
                {isEnablePrinting && (
                  <div className="flex gap-5">
                    <Button
                      disabled={
                        selectedFormulationReportLines.status ==
                          1 &&
                        selectedFormulationReportLines.actualMass >
                          selectedFormulationReportLines.max
                      }
                      onClick={() => {
                        setIsOpenModalReprint(true);
                      }}
                      className={cn(
                        'flex w-[120px] items-center justify-between bg-gray-500 hover:bg-gray-600',
                        {
                          hidden:
                            scanProductCode == '' ||
                            !isReadyToStartWeighing,
                        },
                      )}
                    >
                      <Printer />
                      {isPending ? 'Loading..' : 'Reprint'}
                    </Button>
                  </div>
                )}
                <Button
                  disabled={
                    isEnableOverweightProtection &&
                    ((scaleValue ?? 0) >
                      parseFloat(selectedFormulationReportLines.max?.toFixed(
                        appFractionalDigit,
                      )) || // Use nullish coalescing
                      (selectedFormulationReportLines.actualMass >
                        0 &&
                        parseFloat(currentScaleScore.toFixed(
                          appFractionalDigit,
                        )) >
                          parseFloat(selectedFormulationReportLines.max?.toFixed(
                            appFractionalDigit,
                          ))) ||
                      (selectedFormulationReportLines.status ==
                        1 &&
                        selectedFormulationReportLines.actualMass >
                          parseFloat(selectedFormulationReportLines.max?.toFixed(
                            appFractionalDigit,
                          ))))
                  }
                  onClick={() => mutate(currentScaleScore)}
                  className={cn(
                    'flex w-[100px] items-center justify-between bg-blue-800 hover:bg-blue-600',
                    {
                      hidden:
                        scanProductCode == '' ||
                        !isReadyToStartWeighing,
                    },
                  )}
                >
                  <Save />
                  {isPending ? 'Loading..' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* <Dialog open={isOpenModalEqualScoreScale}>
        <DialogContent>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <TriangleAlert color="red" />
            Simpan penimbangan?
          </DialogTitle>
          <DialogDescription>
            Apakah anda yakin ingin menyimpan hasil
            penimbangan
          </DialogDescription>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="w-[90px] border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-500"
              onClick={() =>
                setIsOpenModalEqualScoreScale(false)
              }
            >
              Batal
            </Button>
            <Button
              type="button"
              className="w-[90px] bg-red-500 hover:bg-red-400"
              onClick={() => mutate(currentScaleScore)}
            >
              Ya
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      <Dialog open={isOpenModalHasMoreScoreScale}>
        <DialogContent hideCloseButton>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <TriangleAlert color="red" />
            Timbangan bermasalah
          </DialogTitle>
          <DialogDescription className="flex flex-col items-center text-center font-semibold">
            <img
              src="/assets/approval-problem.png"
              alt="Error Boundary Image"
              className="w-[200px]"
            />
            <h1 className="text-center">
              Nilai Timbangan Diluar Toleransi Maksimum.
              Hubungi Supervisor Untuk Melanjutkan
              Penimbangan
            </h1>
          </DialogDescription>

          <DialogFooter>
            <Button
              type="button"
              className="w-full bg-red-500 hover:bg-red-400"
              onClick={() =>
                handleLogoutAndUnsubscribeStates()
              }
            >
              Keluar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpenModalReprint}>
        <DialogContent>
          <DialogTitle className="flex items-center gap-2 text-gray-500">
            <TriangleAlert color="gray" />
            Print ulang transaksi terakhir?
          </DialogTitle>
          <DialogDescription>
            Apakah anda yakin ingin melakukan reprint
          </DialogDescription>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="w-[90px] border border-gray-500 text-gray-500 hover:bg-gray-50 hover:text-gray-500"
              onClick={() => setIsOpenModalReprint(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="w-[90px] bg-gray-500 hover:bg-gray-400"
              onClick={() => rePrint()}
            >
              Ya
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpenModalInstruction}>
        <DialogContent className="max-w-3xl">
          {' '}
          {/* Adjust the width */}
          <DialogTitle className="flex items-center gap-2 text-gray-500">
            <TriangleAlert color="gray" />
            Instruction Details
          </DialogTitle>
          <DialogDescription className="mb-4">
            Below are the instructions for this formulation:
          </DialogDescription>
          {/* Read-only Textarea for Instructions */}
          <textarea
            value={
              selectedFormulationReportLines?.instruction ||
              'No instructions available.'
            }
            readOnly
            disabled
            className="h-64 w-full cursor-not-allowed resize-none rounded-md border border-gray-300 bg-gray-100 p-4 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300" // Larger height (h-64)
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              className="w-[90px] bg-gray-500 hover:bg-gray-400"
              onClick={() =>
                setIsOpenModalInstruction(false)
              } // Close the modal
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpenModalNotes}>
        <DialogContent
          className={cn('max-w-3xl', {
            'pb-[280px]': isShowVirtualKeyboard,
          })}
        >
          {/* Adjusted width to match instruction dialog */}
          <DialogTitle className="flex items-center gap-2 text-gray-500">
            <TriangleAlert color="gray" />
            Masukkan notes yang diinginkan
          </DialogTitle>

          <DialogDescription className="mb-4">
            Apakah anda yakin ingin menambahkan notes?
          </DialogDescription>

          {/* Textarea for Notes */}
          <div className="my-4">
            <textarea
              placeholder="Masukkan catatan di sini"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onFocus={() =>
                handleCurrentFocusField('notes')
              }
              className="h-52 w-full resize-none rounded-md border border-gray-300 bg-gray-100 p-4 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300" // Larger height (h-64) and padding
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-[90px] border border-gray-500 text-gray-500 hover:bg-gray-50 hover:text-gray-500"
              onClick={() => setIsOpenModalNotes(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="w-[90px] bg-blue-500 hover:bg-gray-400"
              onClick={() => setIsOpenModalNotes(false)}
            >
              OK
            </Button>
            <VirtualKeyboard
              isVisible={isShowVirtualKeyboard && true}
              onChange={handleVirtualKeyboardChange}
              // @ts-expect-error
              keyboardRef={keyboard}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpenModalBatch}>
        <DialogContent
          className={cn('max-w-3xl', {
            'pb-[280px]': isShowVirtualKeyboard,
          })}
        >
          <DialogTitle className="flex items-center gap-2 text-gray-500">
            <TriangleAlert color="gray" />
            Masukkan nomor batch yang diinginkan
          </DialogTitle>
          <DialogDescription>
            Apakah anda yakin ingin menambahkan batch
            number?
          </DialogDescription>

          {/* Input for Batch Number */}
          <div className="my-4">
            <Input
              placeholder="Masukkan nomor batch"
              value={productBatchNumber}
              onChange={(e) =>
                setProductBatchNumber(e.target.value)
              }
              className="w-full rounded-md border border-gray-300 p-2"
              onFocus={() =>
                handleCurrentFocusField('batch')
              }
            />
          </div>

          <DialogFooter className="flex flex-col">
            <Button
              type="button"
              className="w-[90px] bg-blue-500 hover:bg-gray-400"
              onClick={() => setIsOpenModalBatch(false)}
            >
              OK
            </Button>
            <VirtualKeyboard
              isVisible={isShowVirtualKeyboard && true}
              onChange={handleVirtualKeyboardChange}
              // @ts-expect-error
              keyboardRef={keyboard}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
