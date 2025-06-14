import { Card, CardHeader } from '~/components/ui/card';
import { Box } from 'lucide-react';
import { getUserRole } from '~/lib/helpers';
import { Progress } from '~/components/ui/progress';
import { cn } from '~/lib/utils';
import { IFormulationReportsLines } from '~/lib/types/responses';

import {
  useFormulationReport,
  useUserDisplayStore,
} from '~/lib/store/store';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

export const MaterialListCards = () => {
  const navigate = useNavigate();
  const isLoggedInAsAdmin = getUserRole() == 'Admin';

  const {
    setIsOpenDialogScanProduct,
    isOpenDialogScanProduct,
    setIsAdminScannedProductCode,
  } = useUserDisplayStore();

  const {
    formulationReportsLines,
    mustFollowOrder,
    isDoneAllRawMaterials,
    appFractionalDigit,

    setProductBatchNumber,
    setIsReadyToStartWeighing,
    setSelectedFormulationReportLines,
  } = useFormulationReport((state) => state);

  const [searchParams, setSearch] = useSearchParams();
  const itemSelected = searchParams.get('item');
  const filterMaterialLists = searchParams.get(
    'filter_materials',
  );

  const formulationReportLinesDone = formulationReportsLines.filter((item: any) => item.status == 1) // prettier-ignore
  const formulationReportLinesEmpty = formulationReportsLines.filter((item: any) => item.actualMass == 0 && item.status == 0) // prettier-ignore
  const formulationReportLinesPartial = formulationReportsLines.filter((item: any) => item.actualMass > 0 && item.status == 0) // prettier-ignore

  const getDataToRender = () => {
    switch (filterMaterialLists) {
      case 'done':
        return formulationReportLinesDone;

      case 'partial':
        return formulationReportLinesPartial;

      case 'empty':
        return formulationReportLinesEmpty;

      case 'all':
        return formulationReportsLines;

      default:
        return formulationReportsLines;
    }
  };

  const handleSelectCard = (
    item: IFormulationReportsLines,
    idx: number,
  ) => {
    setProductBatchNumber('');

    if (mustFollowOrder && !isLoggedInAsAdmin) {
      return;
    } else if (isDoneAllRawMaterials) {
      return;
    } else {
      setIsReadyToStartWeighing(false);
      setIsOpenDialogScanProduct(true);
      navigate(
        `?item=${idx}&filter_materials=${filterMaterialLists}`,
      );
      setSelectedFormulationReportLines(item);
    }

    if (getUserRole() == 'Admin') {
      setIsAdminScannedProductCode(false);
    }
  };

  return (
    <>
      {getDataToRender().map((item: any, idx: number) => (
        <Card
          key={item.id}
          onClick={() => handleSelectCard(item, idx)}
          className={cn(
            'mt-3 flex w-full cursor-pointer items-center justify-center gap-3 bg-[#eff0fa] p-5 transition-colors',
            {
              'border border-yellow-400 bg-yellow-200':
                idx == parseInt(itemSelected!),
              'cursor-not-allowed': mustFollowOrder && !isLoggedInAsAdmin, // prettier-ignore
            },
          )}
        >
          <CardHeader
            className={cn(
              'flex w-[110px] items-center justify-center rounded-md border transition-colors',
              {
                'bg-[#eff0fa]': item.actualMass == 0,
                'bg-yellow-500':
                  item.actualMass <
                    item.min?.toFixed(appFractionalDigit) &&
                  item.actualMass !== 0,
                'bg-green-500':
                  item.actualMass >=
                    item.min?.toFixed(appFractionalDigit) &&
                  item.actualMass <=
                    item.max?.toFixed(appFractionalDigit) &&
                  item.actualMass !== 0,
                'bg-red-500':
                  item.actualMass >
                  item.max?.toFixed(appFractionalDigit),
              },
            )}
          >
            <Box
              size={50}
              color={
                (item.actualMass == item.targetMass &&
                  item.actualMass !== 0) ||
                (item.actualMass < item.targetMass &&
                  item.actualMass !== 0) ||
                (item.actualMass > item.targetMass &&
                  item.actualMass !== 0)
                  ? 'white'
                  : 'black'
              }
            />{' '}
          </CardHeader>

          <div className="flex h-full w-full flex-col justify-center">
            <div className="h-full">
              <h1 className="text-xl font-semibold">
                {item.productName}
              </h1>
              <h2 className="pb-4 pl-[1px] font-semibold">
                {item.productCode}
              </h2>
              <Progress
                value={
                  (item.actualMass / item.targetMass) * 100
                }
                className="h-2 w-full text-red-500"
                indicatorColor="bg-blue-500"
              />
              <h4>
                {parseFloat(item.actualMass as any).toFixed(
                  appFractionalDigit,
                )}{' '}
                /{' '}
                {parseFloat(item.targetMass as any).toFixed(
                  appFractionalDigit,
                )}{' '}
                {item.unit}
              </h4>
            </div>
          </div>
        </Card>
      ))}
      <div className="h-[70px]"></div>
    </>
  );
};
