import { cn } from '~/lib/utils';
import { useEffect } from 'react';

import {
  useFormulationReport,
  useUserDisplayStore,
} from '~/lib/store/store';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  SquareCheck,
  SquareMinus,
  Square,
  Box,
} from 'lucide-react';

const icons = [
  {
    Component: SquareCheck,
    name: 'SquareCheck',
    filter_param: 'done',
  },
  {
    Component: SquareMinus,
    name: 'SquareMinus',
    filter_param: 'partial',
  },
  {
    Component: Square,
    name: 'Square',
    filter_param: 'empty',
  },
  {
    Component: Box,
    name: 'Box',
    filter_param: 'all',
  },
] as const;

export const FilterFormulation = ({
  allMaterialsCount,
  doneMaterialsCount,
  emptyMaterialsCount,
  partialMaterislCount,
}: {
  allMaterialsCount: number;
  doneMaterialsCount: number;
  emptyMaterialsCount: number;
  partialMaterislCount: number;
}) => {
  const navigate = useNavigate();
  const {
    isDoneAllRawMaterials,
    mustFollowOrder,
    formulationReportsLines,
    selectedFormulationReportLines,

    setSelectedFormulationReportLines,
    setScanProductCode,
  } = useFormulationReport();

  const {
    setIsOpenDialogScanProduct,
    isOpenDialogScanProduct,
  } = useUserDisplayStore();

  let targetIdx = 0;
  let targetSeequence = Infinity;

  (formulationReportsLines ?? []).forEach(
    (element: any, idx: number) => {
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

  const [searchParams, setSearch] = useSearchParams();
  const filterMaterialLists = searchParams.get(
    'filter_materials',
  );

  const getCounts = (filter: string) => {
    switch (filter) {
      case 'done':
        return doneMaterialsCount;

      case 'partial':
        return partialMaterislCount;

      case 'empty':
        return emptyMaterialsCount;

      case 'all':
        return allMaterialsCount;

      default:
        return allMaterialsCount;
    }
  };

  useEffect(() => {
    if (mustFollowOrder && !isDoneAllRawMaterials) {
      setIsOpenDialogScanProduct(true);
    }
  }, []);

  return (
    <div className="h-[60px] w-full rounded-md bg-[#eff0fa]">
      <div className="container mx-auto flex h-full items-center justify-between">
        {icons.map((icon, index) => {
          const IconComponent = icon.Component;
          return (
            <div
              key={index}
              className="flex cursor-pointer items-center gap-1 transition-all"
              onClick={() => {
                if (
                  mustFollowOrder &&
                  icon.filter_param == 'all' &&
                  !isDoneAllRawMaterials
                ) {
                  setIsOpenDialogScanProduct(true);
                  setSelectedFormulationReportLines(
                    formulationReportsLines[targetIdx],
                  );
                  navigate(
                    `?item=${targetIdx}&filter_materials=${icon.filter_param}`,
                  );
                } else {
                  setScanProductCode('');
                  navigate(
                    `?filter_materials=${icon.filter_param}`,
                  );
                }
              }}
            >
              <IconComponent
                className={cn(
                  'rounded-md text-black transition-colors',
                  {
                    "text-white bg-gray-500": filterMaterialLists == icon.filter_param, // prettier-ignore
                  },
                )}
                size={24}
              />
              <span className="font-semibold">
                {getCounts(icon.filter_param)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
