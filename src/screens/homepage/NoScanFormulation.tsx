import { Box, ClipboardMinus } from 'lucide-react';
import { ProgressScaleV3 } from '~/components/ui/progress-scale-v3';
import { ProgressScale } from '~/components/ui/progress-scales';
import { useRandomProgressValues } from '~/hooks/useProgressValue';

export const NoScanFormulation = ({scaleName, scaleConnect}: {scaleName: string, scaleConnect: (isButtonPressed: boolean) => void}) => {
  const values = useRandomProgressValues(4, 1000);
  return (
    <div className="flex h-full w-full flex-col gap-4 pl-2 pr-4">
      <div className="flex items-center justify-between">
        <div
          onClick={() => scaleConnect(true)} 
          className="flex items-center gap-3">
          <div className="rounded-full bg-gray-800 p-3">
            <ClipboardMinus size={32} color="gray" />
          </div>
          <h1 className="text-[30px] font-semibold">
            {scaleName ? scaleName : "Scale"}
          </h1>
        </div>

        <div className="flex items-end">
          <h1 className="text-[60px] font-bold text-blue-500">
            0.0
          </h1>
          <span className="text-xl font-semibold text-blue-500">
            {/* {selectedFormulationReportLines.unit} */}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 sm:h-[140px] sm:flex-row">
        <div className="w-full rounded-lg bg-[#eff0fa] p-3">
          <h1 className="text-lg font-semibold">
            Work Order
          </h1>
        </div>
        <div className="w-full rounded-lg bg-[#eff0fa] p-3">
          <h1 className="text-lg font-semibold">
            Formula Name
          </h1>
        </div>
        <div className="w-full rounded-lg bg-[#eff0fa] p-3">
          <h1 className="text-lg font-semibold">
            Order Qty
          </h1>
        </div>
      </div>

      <div className="flex h-full flex-col space-y-4 rounded-md bg-[#eff0fa] p-4">
        <div className="flex items-center">
          <Box size={40} />
          <h1 className="text-2xl font-semibold">-</h1>
        </div>
        <div>
          {/* <ProgressScale
            value={values}
            indicatorColors={[
              'bg-yellow-400',
              'bg-black',
              'bg-green-400',
              'bg-red-500',
            ]}
          /> */}
          <ProgressScaleV3
            minValue={0}
            maxValue={0}
            value={0}
            isHasMoreThanMaximum={false}
            indicatorColor="bg-green-500"
          />
        </div>
        <h1>Remaining</h1>
      </div>
    </div>
  );
};
