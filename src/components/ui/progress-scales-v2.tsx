import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '~/lib/utils';

interface CustomProgressProps
  extends React.ComponentPropsWithoutRef<
    typeof ProgressPrimitive.Root
  > {
  indicatorColor: string;
  maxValue: number;
  minValue: number;
  value: number;
  isHasMoreThanMaximum: boolean;
}

const ProgressScaleV2 = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  CustomProgressProps
>(
  (
    {
      // className,
      value,
      // indicatorColor,
      maxValue,
      minValue,
      // isHasMoreThanMaximum,
      // ...props
    },
    // ref,
  ) => {
    let progressColor = 'bg-green-500';
    if (value < minValue) {
      progressColor = 'bg-yellow-500';
    } else if (value > maxValue) {
      progressColor = 'bg-red-500';
    }

    const minPos = (minValue / (maxValue * 1.2)) * 100;
    const maxPos = (maxValue / (maxValue * 1.2)) * 100;
    const progressWidth = (value / (maxValue * 1.2)) * 100; // prettier-ignore
    const spacingWidth = maxPos - minPos;
    console.warn(minPos);
    console.warn('max', minPos);

    return (
      <div className="relative h-6 w-full rounded-lg border-gray-500 bg-gray-200">
        <div
          className={cn(
            `absolute h-full ${progressColor} rounded-lg transition-all`,
          )}
          style={{ width: `${progressWidth}%` }}
        />
        <div className="absolute flex h-full w-full items-center justify-between">
          <div
            className={cn(
              'absolute h-full border-r border-black',
            )}
            style={{ left: `${minPos}%` }}
          />
          <div
            className="absolute h-full border-r border-black bg-blue-500"
            style={{ left: `${maxPos}%` }}
          />
        </div>
        <div className="relative flex h-full items-center justify-center text-xs text-black">
          {/* {value} (min: {minValue}, max: {maxValue}) */}
        </div>
      </div>
    );
  },
);

ProgressScaleV2.displayName =
  ProgressPrimitive.Root.displayName;

export { ProgressScaleV2 };
