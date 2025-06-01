import ContainerLayout from '~/components/ContainerLayout';

import { useState } from 'react';
import { FormCreateToleranceGrouping } from './FormCreateToleranceGrouping';
import { HeaderToleranceGrouping } from './HeaderToleranceGrouping';
import { TableListToleranceGroupingLines } from './TableListToleranceGroupingLines';
import { FormToleranceGroupingLines } from './FormToleranceGroupingLines';
import { ToleranceGroupingLines } from '~/lib/types/types';
import { useSearchParams } from 'react-router-dom';

export default function ToleranceGroupings() {
  const [searchParams, setSearch] = useSearchParams();

  const [
    filledToleranceGoupingLines,
    setFilledToleranceGroupingLines,
  ] = useState<ToleranceGroupingLines[]>([]);

  const isOpenFormToleranceGroupingLines = searchParams.get('create_tolerance_grouping_lines') == 'true'; // prettier-ignore
  const isOpenEditFormToleranceGroupingLines = searchParams.get('edit_tolerance_grouping_lines') == 'true'; // prettier-ignore

  return (
    <>
      <ContainerLayout className="mr-[20px] flex-col">
        <HeaderToleranceGrouping />
        <FormCreateToleranceGrouping
          filledToleranceGoupingLines={
            filledToleranceGoupingLines
          }
          setFilledToleranceGroupingLines={
            setFilledToleranceGroupingLines
          }
        />
        <TableListToleranceGroupingLines
          filledToleranceGoupingLines={
            filledToleranceGoupingLines
          }
          setFilledToleranceGroupingLines={
            setFilledToleranceGroupingLines
          }
        />
      </ContainerLayout>

      {(isOpenFormToleranceGroupingLines ||
        isOpenEditFormToleranceGroupingLines) && (
        <FormToleranceGroupingLines
          filledToleranceGoupingLines={
            filledToleranceGoupingLines
          }
          setFilledToleranceGroupingLines={
            setFilledToleranceGroupingLines
          }
        />
      )}
    </>
  );
}
