import FormDialogScanFormula from '~/components/FormDialogScanFormula';
import FormDialogScanFormulaManual from '~/components/FormDialogScanFormulaManual';
import ContainerLayout from '~/components/ContainerLayout';
import MaterialLists from './MaterialLists';

import { useEffect, useState } from 'react';
import { nightSleep } from '~/lib/helpers';
import { FilterFormulation } from './FilterFormulation';
import { Store } from 'tauri-plugin-store-api';
import { connectToGuardWebSocket, connectToScaleWebSocket } from '~/actions/websocket.action';
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

  const { isExpandedSidebar, setGuardedMaterial, setIsScaleConnected, setScaleFractionalDigit } = useUserDisplayStore((state) => state); // prettier-ignore
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
      isButtonPressed
    );
  }

  useEffect(() => {
    scaleConnect();
    connectToGuardWebSocket(
      setGuardedMaterial
    )
    handleDetectEnablePrinting();
    handleGetFractionalDigits();
    handleDetectEnableManualWorkOrder();
  }, []);

  useEffect(() => {
    handleDetectConnectToScale();
  }, [scaleValue, scaleUnit, location.pathname]);

  return (
    <>
      <ContainerLayout>
      
        {isExpandedSidebar && (
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
        )}
      </ContainerLayout>

      {isOpenFormDialogFormula === 'true' &&
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
      )}
    </>
  );
}
