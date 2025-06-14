import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '~/lib/utils';
import {
  useFormulationReport,
  useUserAuthStore,
  useUserDisplayStore,
} from '~/lib/store/store';

interface CustomProgressProps
  extends React.ComponentPropsWithoutRef<
    typeof ProgressPrimitive.Root
  > {
  indicatorColor: string;
  maxValue: number;
  minValue: number;
  value: number;
  isHasMoreThanMaximum?: boolean;
}

const ProgressScaleV3 = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  CustomProgressProps
>(
  (
    {
      className,
      value,
      indicatorColor,
      maxValue,
      minValue,
      isHasMoreThanMaximum,
      ...props
    },
    ref,
  ) => {
    const [val, setVal] = React.useState(0);
    const isEqualMinMaxAndCurrentVal = value == minValue && minValue == maxValue // prettier-ignore

    const { isExpandedSidebar } = useUserDisplayStore(
      (state) => state,
    );

    // RECHECK
    const { isUserScannedMaterialReports } =
      useUserAuthStore((state) => state);

    const { isReadyToStartWeighing } = useFormulationReport(); // prettier-ignore

    React.useEffect(() => {
      let calculatedVal;
      if (value > maxValue) {
        // Jika nilai melebihi maksimum
        calculatedVal =
          90 + ((value - maxValue) / maxValue) * 10;
      } else if (value < minValue) {
        // Jika nilai berada di bawah minimum
        calculatedVal = (value / minValue) * 75;
      } else {
        // Jika nilai berada di antara minimum dan maksimum
        calculatedVal =
          75 +
          ((value - minValue) / (maxValue - minValue)) * 15;
      }

      setVal(calculatedVal);
      return () => setVal(0);
    }, [value, minValue, maxValue]);

    React.useEffect(() => {
      const shouldProgressFull = value - maxValue > 0;
      if (shouldProgressFull) {
        setVal(100);
      }
    }, [isHasMoreThanMaximum, isReadyToStartWeighing]);

    React.useEffect(() => {
      if (
        isEqualMinMaxAndCurrentVal &&
        isUserScannedMaterialReports
      ) {
        setVal(90);
      }
    }, [value, minValue, maxValue]);

    return (
      <div className="relative rounded-sm border border-black">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative h-6 w-full overflow-hidden rounded-sm bg-secondary',
            className,
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              `relative z-10 h-full w-full flex-1 rounded-md transition-all ${indicatorColor}`,
              {
                'animate-pulse': isHasMoreThanMaximum,
                'bg-green-500': isEqualMinMaxAndCurrentVal,
              },
            )}
            style={{
              transform: `translateX(-${100 - (val || 0)}%)`,
            }}
          />
        </ProgressPrimitive.Root>
        <div
          className={cn(
            'absolute right-[73px] top-0 h-full w-[113px] border-l-2 bg-white',
            {
              'right-[114px] w-[170px]': !isExpandedSidebar,
            },
          )}
        ></div>
        <div
          className={cn(
            'absolute right-[183px] top-0 z-20 h-full border-l-2 border-red-500',
            {
              'right-[114px] w-[170px]': !isExpandedSidebar,
            },
          )}
        ></div>
        <div
          className={cn(
            'absolute right-[72px] top-0 z-20 h-full border-l-2 border-red-500',
            {
              'right-[113px]': !isExpandedSidebar,
            },
          )}
        ></div>
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-[73px] rounded-md bg-white',
            {
              'w-[114px]': !isExpandedSidebar,
            },
          )}
        ></div>
      </div>
    );
  },
);

ProgressScaleV3.displayName =
  ProgressPrimitive.Root.displayName;

export { ProgressScaleV3 };
