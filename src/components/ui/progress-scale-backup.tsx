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
    // Calculate the percentage positions of the minimum and maximum values
    const minPercent = (
      (minValue / maxValue) *
      100
    ).toFixed(3);
    const maxPercent = '100'; // Maximum value will always be at the end (100%)
    const progressPercent = (
      (value / maxValue) *
      100
    ).toFixed(3);

    return (
      <div className="relative w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative h-5 w-full overflow-hidden rounded-md border bg-secondary',
            className,
          )}
          {...props}
        >
          {/* Render the green segment between minValue and maxValue */}
          <div
            className="absolute h-full bg-green-500"
            style={{
              left: `${minPercent}%`,
              // @ts-ignore
              width: `${100 - minPercent}%`,
              clipPath: `inset(0% ${100 - parseFloat(maxPercent)}% 0% 0%)`,
            }}
          />
          {/* Render the progress indicator */}
          <ProgressPrimitive.Indicator
            className={cn(
              `absolute h-full transition-all ${indicatorColor}`,
              {
                'animate-pulse bg-red-500':
                  isHasMoreThanMaximum,
              },
            )}
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </ProgressPrimitive.Root>
        {/* Render minimum and maximum markers */}
        <div className="absolute left-0 top-0 h-5 w-full">
          <div
            className="absolute h-full border-l-2 border-red-600 bg-red-500 transition-all"
            style={{ left: `${minPercent}%` }}
            title={`Min: ${minValue}`}
          />
          <div
            className="absolute h-full transition-all"
            style={{ left: `${maxPercent}%` }}
            title={`Max: ${maxValue}`}
          />
        </div>
      </div>
    );
  },
);

ProgressScaleV2.displayName =
  ProgressPrimitive.Root.displayName;

export { ProgressScaleV2 };
